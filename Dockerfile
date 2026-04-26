# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the working directory
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code into the working directory
COPY . .

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Run the command to start the application when the container launches
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the working directory
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code into the working directory
COPY . .

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Run the command to start the application when the container launches
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
