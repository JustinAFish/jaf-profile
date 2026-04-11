"""
Test script to verify Pinecone migration is working correctly.
Run this after setting up your Pinecone API key.
"""

import os
import sys
from pathlib import Path

# Add the app directory to the path
sys.path.append(str(Path(__file__).parent))

def test_pinecone_service():
    """Test basic Pinecone service functionality"""
    print("Testing Pinecone service...")
    
    try:
        from app.services.pinecone_service import PineconeService
        from langchain_core.documents import Document
        
        # Initialize service
        print("1. Initializing Pinecone service...")
        service = PineconeService()
        print("   ✓ Pinecone service initialized successfully")
        
        # Test document count
        print("2. Getting document count...")
        count = service.count_documents()
        print(f"   ✓ Current document count: {count}")
        
        # Test adding a sample document
        print("3. Testing document addition...")
        test_doc = Document(
            page_content="This is a test document for Pinecone migration verification.",
            metadata={"source_file": "test.txt", "test": True}
        )
        
        ids = service.add_documents([test_doc])
        print(f"   ✓ Added test document with ID: {ids[0]}")
        
        # Test similarity search
        print("4. Testing similarity search...")
        results = service.similarity_search("test document", k=1)
        print(f"   ✓ Found {len(results)} results")
        
        if results:
            print(f"   ✓ First result relevance score: {results[0].metadata.get('relevance', 'N/A')}")
        
        print("\n✅ Pinecone service test completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Pinecone service test failed: {str(e)}")
        return False

def test_rag_pipeline():
    """Test RAG pipeline with Pinecone"""
    print("\nTesting RAG pipeline...")
    
    try:
        from app.core.rag import RAGPipeline
        
        # Initialize pipeline
        print("1. Initializing RAG pipeline...")
        pipeline = RAGPipeline()
        print("   ✓ RAG pipeline initialized successfully")
        
        print("\n✅ RAG pipeline test completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ RAG pipeline test failed: {str(e)}")
        return False

def test_document_ingestion():
    """Test document ingestion script"""
    print("\nTesting document ingestion...")
    
    try:
        from scripts.ingest_documents import DocumentIngestor
        
        # Initialize ingestor
        print("1. Initializing document ingestor...")
        ingestor = DocumentIngestor()
        print("   ✓ Document ingestor initialized successfully")
        
        print("\n✅ Document ingestion test completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Document ingestion test failed: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing Pinecone Migration\n")
    print("=" * 50)
    
    # Check for required environment variables
    if not os.environ.get("PINECONE_API_KEY"):
        print("❌ PINECONE_API_KEY environment variable is required")
        print("Please set your Pinecone API key before running this test.")
        return
    
    if not os.environ.get("OPENAI_API_KEY"):
        print("❌ OPENAI_API_KEY environment variable is required")
        print("Please set your OpenAI API key before running this test.")
        return
    
    print("✓ Required environment variables found")
    print("=" * 50)
    
    # Run tests
    tests_passed = 0
    total_tests = 3
    
    if test_pinecone_service():
        tests_passed += 1
    
    if test_rag_pipeline():
        tests_passed += 1
    
    if test_document_ingestion():
        tests_passed += 1
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tests_passed}/{total_tests} tests passed")
    
    if tests_passed == total_tests:
        print("🎉 All tests passed! Pinecone migration is working correctly.")
    else:
        print("⚠️  Some tests failed. Please check the errors above.")

if __name__ == "__main__":
    main() 