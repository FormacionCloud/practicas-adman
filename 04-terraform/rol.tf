# Trust relationship para que el rol pueda ser asumido por EC2
data "aws_iam_policy_document" "web_assume_policy" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

# Rol de ejecución que se asociará al perfil de instancia
# Hace referencia a la trust relationship creada arriba
resource "aws_iam_role" "web_role" {
  name               = "${var.project_name}-web_role"
  path               = "/"
  assume_role_policy = data.aws_iam_policy_document.web_assume_policy.json
}

# Asociación de la política al rol
resource "aws_iam_role_policy_attachment" "web_policy_role_attach" {
  role       = aws_iam_role.web_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Perfil de instancia que se asociará a las instancias creadas por el ASG
# Hace referencia al rol de ejecución creado
resource "aws_iam_instance_profile" "web_profile" {
  name = "${var.project_name}-web-instance-profile"
  role = aws_iam_role.web_role.name
}
