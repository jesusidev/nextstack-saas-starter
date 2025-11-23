module "cloudtrail" {
  source = "../modules/cloudtrail-basic"
  count  = var.enable_cloudtrail ? 1 : 0

  trail_name                 = var.cloudtrail_trail_name != "" ? var.cloudtrail_trail_name : "${var.name}-trail"
  bucket_name                = var.cloudtrail_bucket_name
  is_multi_region_trail      = true
  enable_log_file_validation = true
  tags                       = var.tags
}
