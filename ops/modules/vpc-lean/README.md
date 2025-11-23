# vpc-lean module

Minimal cost VPC with 2 public subnets (for EC2/ALB) and optional 2 private DB subnets. Internet Gateway is always created. NAT Gateways are optional to avoid cost by default.

Inputs
- name_prefix (string)
- cidr_block (string)
- azs (list(string)) length 2 recommended
- create_private_subnets (bool)
- enable_nat_gateway (bool)
- tags (map(string))

Outputs
- vpc_id
- public_subnet_ids
- private_subnet_ids (if created)
- igw_id
- public_route_table_ids
