terraform {
  backend "s3" {
      bucket = "vpod-prod"
      region = "us-east-2"
  }
}

resource "aws_instance" "UserInstance" {
 
	ami  = "${var.stack}"
	key_name = "${var.aws_key_name}"
  instance_type = "${var.instanceType}"
  subnet_id  = "${var.subnetId}"  
  security_groups = ["${var.userSG}"] 
  source_dest_check = false 

	root_block_device {
			volume_type = "io1"
			iops = "200"
			delete_on_termination = true
			volume_size = "${var.volumeSize}"
    }
    tags {
	"Name" = "${var.username}"
	"Type" = "UserHost"
  "InstanceUserID" = "${var.username}"
  "scheduler:ec2-startstop" = "${var.scheduler}"
  "AccountOwner" = "${var.AccountOwner}"
  "Duration" = "${var.duration}"
	}
		
}




