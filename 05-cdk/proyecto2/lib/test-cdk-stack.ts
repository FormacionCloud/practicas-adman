import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import autoscaling = require("aws-cdk-lib/aws-autoscaling");
import ec2 = require("aws-cdk-lib/aws-ec2");
import elbv2 = require("aws-cdk-lib/aws-elasticloadbalancingv2");

export class TestCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "VPC");

    const userData = ec2.UserData.forLinux();

    userData.addCommands(
      "sudo dnf install -y nginx",
      "sudo systemctl enable nginx",
      "sudo systemctl start nginx",
    );

    const asg = new autoscaling.AutoScalingGroup(this, "ASG", {
      vpc,
      launchTemplate: new ec2.LaunchTemplate(this, "LaunchTemplate", {
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.BURSTABLE4_GRAVITON,
          ec2.InstanceSize.MICRO,
        ),
        machineImage: ec2.MachineImage.latestAmazonLinux2023({
          cpuType: ec2.AmazonLinuxCpuType.ARM_64,
        }),
        userData,
        securityGroup: new ec2.SecurityGroup(this, "LaunchTemplateSG", {
          vpc: vpc,
        }),
      }),
    });

    const lb = new elbv2.ApplicationLoadBalancer(this, "LB", {
      vpc,
      internetFacing: true,
    });

    const listener = lb.addListener("Listener", {
      port: 80,
    });

    // Automáticamente se configurarán los grupos de seguridad para permitir tráfico desde ELB a ASG
    listener.addTargets("Target", {
      port: 80,
      targets: [asg],
    });

    listener.connections.allowDefaultPortFromAnyIpv4("Open to the world");

    asg.scaleOnRequestCount("AModestLoad", {
      targetRequestsPerMinute: 60,
    });

    new cdk.CfnOutput(this, "UrlElb", {
      value: lb.loadBalancerDnsName,
    });
  }
}
