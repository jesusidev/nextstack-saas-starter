#!/bin/bash
set -e

# Update system
yum update -y || apt-get update -y

# Install Docker
if ! command -v docker &> /dev/null; then
    yum install -y docker || apt-get install -y docker.io
    systemctl start docker
    systemctl enable docker
    usermod -aG docker ec2-user || usermod -aG docker ubuntu
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Install AWS CLI v2
if ! command -v aws &> /dev/null; then
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    ./aws/install
    rm -rf aws awscliv2.zip
fi

# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
rpm -U ./amazon-cloudwatch-agent.rpm || dpkg -i -E ./amazon-cloudwatch-agent.deb

# Create application directory
mkdir -p /opt/app-template
cd /opt/app-template

# Login to ECR
aws ecr get-login-password --region ${region} | docker login --username AWS --password-stdin ${ecr_repository_url}

# Pull latest image
docker pull ${ecr_repository_url}:latest

# Create environment file
cat > .env.production << EOF
NODE_ENV=production
PORT=${app_port}
AWS_REGION=${region}
S3_ASSETS_BUCKET=${assets_bucket}
%{ if db_secret_arn != "" }
DB_SECRET_ARN=${db_secret_arn}
%{ endif }
ENVIRONMENT=${environment}
EOF

# Create docker-compose file
cat > docker-compose.yml << 'COMPOSE_EOF'
version: '3.8'

services:
  app:
    image: ${ecr_repository_url}:latest
    ports:
      - "${app_port}:${app_port}"
    env_file:
      - .env.production
    restart: unless-stopped
    logging:
      driver: awslogs
      options:
        awslogs-region: ${region}
        awslogs-group: /aws/ec2/${environment}
        awslogs-stream: app-template-app
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:${app_port}/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
COMPOSE_EOF

# Start application
docker-compose up -d

# Setup log rotation
cat > /etc/logrotate.d/app-template << EOF
/opt/app-template/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0644 root root
}
EOF

echo "AppTemplate deployment completed at $(date)" >> /var/log/user-data.log
