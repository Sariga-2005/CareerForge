import logging
from qdrant_client import QdrantClient
from qdrant_client import models
from config.settings import Config

logger = logging.getLogger('ai-brain.qdrant')

class VectorDB:
    _instance = None

    @classmethod
    def get_client(cls) -> QdrantClient:
        if cls._instance is None:
            try:
                cls._instance = QdrantClient(host=Config.QDRANT_HOST, port=Config.QDRANT_PORT)
                logger.info(f"Connected to Qdrant Vector DB at {Config.QDRANT_HOST}:{Config.QDRANT_PORT}")
                cls.initialize_collections(cls._instance)
            except Exception as e:
                logger.error(f"Failed to connect to Qdrant: {str(e)}")
                # We can fallback to local memory if needed, but for now just return None or raise
                cls._instance = None
        return cls._instance

    @classmethod
    def initialize_collections(cls, client: QdrantClient):
        """Create collections if they don't exist"""
        collections = client.get_collections().collections
        collection_names = [c.name for c in collections]

        # Using all-MiniLM-L6-v2 which has an embedding size of 384
        vector_size = 384

        if 'jobs' not in collection_names:
            try:
                client.create_collection(
                    collection_name="jobs",
                    vectors_config=models.VectorParams(
                        size=vector_size,
                        distance=models.Distance.COSINE
                    )
                )
                logger.info("Created 'jobs' collection in Qdrant")
            except Exception as e:
                logger.error(f"Failed to create 'jobs' collection: {str(e)}")

qdrant = VectorDB.get_client()
