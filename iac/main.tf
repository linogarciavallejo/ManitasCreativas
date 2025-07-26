# Terraform block to configure the required AWS provider.
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configure the AWS Provider, setting the region.
provider "aws" {
  region = "us-east-2" # Inferred from the KMS key ARN in the JSON file
  profile = "PersonalSubscription"
}

# Define input variables for settings you might want to change.
variable "db_name" {
  description = "The unique identifier for the new database instance."
  type        = string
  default     = "manitascreativas-prod" # Changed to create a copy
}

variable "db_username" {
  description = "The master username for the database."
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "The master password for the database. Will be prompted on apply."
  type        = string
  sensitive   = true # This ensures the password is not shown in logs.
}

# Main resource block to define the new RDS database instance.
resource "aws_db_instance" "db_copy" {
  # Naming and Engine Configuration
  identifier           = var.db_name
  engine               = "postgres"
  engine_version       = "17.4"
  instance_class       = "db.t4g.micro"
  username             = var.db_username
  password             = var.db_password

  # Storage Configuration
  allocated_storage    = 20
  max_allocated_storage = 1000 # Enables storage autoscaling
  storage_type         = "gp2"
  storage_encrypted    = true
  kms_key_id           = "arn:aws:kms:us-east-2:891377130768:key/4760da70-898f-4a81-9754-cfdc0f61db79"

  # Network and Security
  vpc_security_group_ids = ["sg-057db5b0752070565"]
  db_subnet_group_name = "default-vpc-08e7ee818287f651f"
  publicly_accessible  = true
  multi_az             = false

  # Backup and Maintenance
  backup_retention_period = 1
  backup_window = "03:10-03:40"
  copy_tags_to_snapshot   = true
  auto_minor_version_upgrade = true
  maintenance_window = "fri:06:55-fri:07:25"

  # Additional Configuration
  parameter_group_name      = "default.postgres17"
  deletion_protection       = false
  performance_insights_enabled = true
  performance_insights_kms_key_id = "arn:aws:kms:us-east-2:891377130768:key/4760da70-898f-4a81-9754-cfdc0f61db79"
  performance_insights_retention_period = 7
  enabled_cloudwatch_logs_exports = ["postgresql"]
}