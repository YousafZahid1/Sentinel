import unittest
import docker
import requests
import time

class TestDockerFrontend(unittest.TestCase):

    def setUp(self):
        self.client = docker.from_env()
        self.image_name = "sentinel-frontend"  # Assuming this is the image name

    def test_docker_build(self):
        # Test that the Docker image builds successfully
        try:
            self.client.images.build(path="./frontend", tag=self.image_name)
        except docker.errors.BuildError as e:
            self.fail(f"Docker build failed: {e}")

    def test_container_start(self):
        # Test that a container from the image can start
        try:
            container = self.client.containers.run(self.image_name, detach=True, ports={'80/tcp': 8080})
            time.sleep(5)  # Wait for the container to start
            container.stop()
            container.remove()
        except docker.errors.APIError as e:
            self.fail(f"Failed to start container: {e}")

    def test_frontend_service(self):
        # Test that the frontend service is available
        try:
            container = self.client.containers.run(self.image_name, detach=True, ports={'80/tcp': 8080})
            time.sleep(5)  # Wait for the container to start
            response = requests.get('http://localhost:8080')
            self.assertEqual(response.status_code, 200)
            container.stop()
            container.remove()
        except docker.errors.APIError as e:
            self.fail(f"Failed to start container: {e}")
        except requests.RequestException as e:
            self.fail(f"Request to frontend service failed: {e}")

if __name__ == '__main__':
    unittest.main()