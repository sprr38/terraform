output "private_ip" {
  value = "${aws_instance.UserInstance.private_ip}"
}
