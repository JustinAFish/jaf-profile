"""
Document ingestion script for Pinecone
This script loads documents from various file formats into Pinecone for vector search.
Supports PDF, DOCX, TXT, and MD files.
"""

import os
import sys
import argparse
from pathlib import Path
from typing import List
import logging

# Add the parent directory to the path so we can import our modules
sys.path.append(str(Path(__file__).parent.parent))

from langchain_core.documents import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import (
    PyPDFLoader,
    TextLoader,
    UnstructuredMarkdownLoader
)
from app.services.pinecone_service import PineconeService
from app.config import get_settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DocumentIngestor:
    """Handles document ingestion into Pinecone"""
    
    def __init__(self):
        """Initialize the ingestor with Pinecone service and text splitter"""
        self.pinecone_service = PineconeService()
        
        # Log Pinecone configuration being used
        settings = get_settings()
        logger.info(f"Using Pinecone - Index: {settings.PINECONE_INDEX_NAME}, Namespace: {settings.PINECONE_NAMESPACE}")
        
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
        
    def load_pdf(self, file_path: str) -> List[Document]:
        """Load and split a PDF file"""
        try:
            loader = PyPDFLoader(file_path)
            documents = loader.load()
            return self.text_splitter.split_documents(documents)
        except Exception as e:
            logger.error(f"Error loading PDF {file_path}: {e}")
            return []
    
    def load_text_file(self, file_path: str) -> List[Document]:
        """Load and split a text file"""
        try:
            loader = TextLoader(file_path, encoding='utf-8')
            documents = loader.load()
            return self.text_splitter.split_documents(documents)
        except Exception as e:
            logger.error(f"Error loading text file {file_path}: {e}")
            return []
    
    def load_markdown_file(self, file_path: str) -> List[Document]:
        """Load and split a markdown file"""
        try:
            loader = UnstructuredMarkdownLoader(file_path)
            documents = loader.load()
            return self.text_splitter.split_documents(documents)
        except Exception as e:
            logger.error(f"Error loading markdown file {file_path}: {e}")
            return []
    
    def load_docx_file(self, file_path: str) -> List[Document]:
        """Load and split a DOCX file"""
        try:
            # Try to import docx loader
            from langchain_community.document_loaders import Docx2txtLoader
            loader = Docx2txtLoader(file_path)
            documents = loader.load()
            return self.text_splitter.split_documents(documents)
        except ImportError:
            logger.warning("docx2txt not installed. Install with: pip install docx2txt")
            return []
        except Exception as e:
            logger.error(f"Error loading DOCX file {file_path}: {e}")
            return []
    
    def load_single_file(self, file_path: str) -> List[Document]:
        """Load a single file based on its extension"""
        file_path = Path(file_path)
        
        if not file_path.exists():
            logger.error(f"File not found: {file_path}")
            return []
        
        extension = file_path.suffix.lower()
        
        if extension == '.pdf':
            documents = self.load_pdf(str(file_path))
        elif extension == '.txt':
            documents = self.load_text_file(str(file_path))
        elif extension == '.md':
            documents = self.load_markdown_file(str(file_path))
        elif extension == '.docx':
            documents = self.load_docx_file(str(file_path))
        else:
            logger.warning(f"Unsupported file type: {extension}")
            return []
        
        # Add source metadata to all documents
        for doc in documents:
            if doc.metadata is None:
                doc.metadata = {}
            doc.metadata['source_file'] = str(file_path)
            doc.metadata['file_name'] = file_path.name
        
        return documents
    
    def load_directory(self, directory_path: str) -> List[Document]:
        """Load all supported files from a directory"""
        directory_path = Path(directory_path)
        
        if not directory_path.exists():
            logger.error(f"Directory not found: {directory_path}")
            return []
        
        all_documents = []
        supported_extensions = {'.pdf', '.txt', '.md', '.docx'}
        
        for file_path in directory_path.rglob('*'):
            if file_path.is_file() and file_path.suffix.lower() in supported_extensions:
                logger.info(f"Loading file: {file_path}")
                documents = self.load_single_file(str(file_path))
                all_documents.extend(documents)
        
        return all_documents
    
    def ingest_documents(self, documents: List[Document]) -> bool:
        """Ingest documents into Pinecone"""
        if not documents:
            logger.warning("No documents to ingest")
            return False
        
        try:
            logger.info(f"Ingesting {len(documents)} document chunks into Pinecone...")
            self.pinecone_service.add_documents(documents)
            logger.info("Successfully ingested documents")
            return True
        except Exception as e:
            logger.error(f"Error ingesting documents: {e}")
            return False

def main():
    """Main function to handle command line arguments and run ingestion"""
    parser = argparse.ArgumentParser(description="Ingest documents into Pinecone")
    parser.add_argument(
        "--path", 
        type=str, 
        required=True, 
        help="Path to file or directory to ingest"
    )
    parser.add_argument(
        "--clear", 
        action="store_true", 
        help="Clear existing namespace before ingesting"
    )
    
    args = parser.parse_args()
    
    # Initialize the ingestor
    ingestor = DocumentIngestor()
    
    # Clear namespace if requested
    if args.clear:
        logger.info("Clearing existing Pinecone namespace...")
        ingestor.pinecone_service.delete_namespace()
        # No need to reinitialize service for Pinecone
    
    # Check if path is file or directory
    path = Path(args.path)
    
    if path.is_file():
        logger.info(f"Loading single file: {path}")
        documents = ingestor.load_single_file(str(path))
    elif path.is_dir():
        logger.info(f"Loading directory: {path}")
        documents = ingestor.load_directory(str(path))
    else:
        logger.error(f"Path not found: {path}")
        return
    
    # Ingest documents
    if documents:
        logger.info(f"Loaded {len(documents)} document chunks")
        success = ingestor.ingest_documents(documents)
        
        if success:
            # Print namespace stats
            count = ingestor.pinecone_service.count_documents()
            logger.info(f"Pinecone namespace now contains {count} documents")
        else:
            logger.error("Failed to ingest documents")
    else:
        logger.warning("No documents were loaded")

if __name__ == "__main__":
    main() 