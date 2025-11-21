# Servidor web con base de datos en CloudFormation

## Introducción
Esta práctica la realizaremos en el **Learner Lab** de AWS Academy.

Desplegaremos una infraestructura sencilla, basada en una máquina EC2 y una base de datos instalada en la misma máquina. La plantilla no solamente creará los recursos, sino que realizará la **conexión** de la aplicación y la base de datos.

Haremos uso de las siguientes características de CloudFormation:

- Parámetros de entrada
- *Mappings*
- *Metadata* y *helper scripts* (`cfn-init`, `cfn-signal` y `cfn-hup`)

## Plantilla

La plantilla puedes consultarla en el fichero [template-cf-metadata.yml](./template-cf-metadata.yml) de este repositorio.

<details> <summary> Pulsa para ver el contenido del fichero </summary>

```yaml
AWSTemplateFormatVersion: 2010-09-09
Description: >-
  Plantilla para desplegar una pila LAMP en EC2. La máquina EC2 incluye una
  base de datos MySQL, un servidor Apache y el lenguaje PHP.
Parameters:
  DBName:
    Default: MyDatabase
    Description: MySQL database name
    Type: String
    MinLength: '1'
    MaxLength: '64'
    AllowedPattern: '[a-zA-Z][a-zA-Z0-9]*'
    ConstraintDescription: must begin with a letter and contain only alphanumeric characters.
  DBUser:
    NoEcho: 'true'
    Description: Username for MySQL database access
    Type: String
    MinLength: '1'
    MaxLength: '16'
    AllowedPattern: '[a-zA-Z][a-zA-Z0-9]*'
    ConstraintDescription: must begin with a letter and contain only alphanumeric characters.
  DBPassword:
    NoEcho: 'true'
    Description: Password for MySQL database access
    Type: String
    MinLength: '1'
    MaxLength: '41'
    AllowedPattern: '[a-zA-Z0-9]*'
    ConstraintDescription: must contain only alphanumeric characters.
  DBRootPassword:
    NoEcho: 'true'
    Description: Root password for MySQL
    Type: String
    MinLength: '1'
    MaxLength: '41'
    AllowedPattern: '[a-zA-Z0-9]*'
    ConstraintDescription: must contain only alphanumeric characters.
  InstanceType:
    Description: WebServer EC2 instance type
    Type: String
    Default: t2.small
    AllowedValues:
      - t2.nano
      - t2.micro
      - t2.small
    ConstraintDescription: must be a valid EC2 instance type.
  SSHLocation:
    Description: ' The IP address range that can be used to SSH to the EC2 instances'
    Type: String
    MinLength: '9'
    MaxLength: '18'
    Default: 0.0.0.0/0
    AllowedPattern: '(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})/(\d{1,2})'
    ConstraintDescription: must be a valid IP CIDR range of the form x.x.x.x/x.
Mappings:
  AWSInstanceType2Arch:
    t2.nano:
      Arch: HVM64
    t2.micro:
      Arch: HVM64
    t2.small:
      Arch: HVM64
  AWSRegionArch2AMI:
    us-east-1:
      HVM64: ami-032930428bf1abbff
      HVMG2: ami-0aeb704d503081ea6
    us-west-1:
      HVM64: ami-088c153f74339f34c
      HVMG2: ami-0a7fc72dc0e51aa77
Resources:
  WebServerInstance:
    Type: AWS::EC2::Instance
    Metadata:
      AWS::CloudFormation::Init:
        configSets:
          InstallAndRun:
            - Install
            - Configure
        Install:
          packages:
            yum:
              mysql: []
              mysql-server: []
              mysql-libs: []
              httpd: []
              php: []
              php-mysql: []
          files:
            /var/www/html/index.php:
              content: !Join 
                - ''
                - - |
                    <html>
                  - |2
                      <head>
                  - |2
                        <title>AWS CloudFormation PHP Sample</title>
                  - |2
                        <meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
                  - |2
                      </head>
                  - |2
                      <body>
                  - |2
                        <h1>Welcome to the AWS CloudFormation PHP Sample</h1>
                  - |2
                        <p/>
                  - |2
                        <?php
                  - |2
                          // Print out the current data and time
                  - |2
                          print "The Current Date and Time is: <br/>";
                  - |2
                          print date("g:i A l, F j Y.");
                  - |2
                        ?>
                  - |2
                        <p/>
                  - |2
                        <?php
                  - |2
                          // Setup a handle for CURL
                  - |2
                          $curl_handle=curl_init();
                  - |2
                          curl_setopt($curl_handle,CURLOPT_CONNECTTIMEOUT,2);
                  - |2
                          curl_setopt($curl_handle,CURLOPT_RETURNTRANSFER,1);
                  - |2
                          // Get the hostname of the intance from the instance metadata
                  - |2
                          curl_setopt($curl_handle,CURLOPT_URL,'http://169.254.169.254/latest/meta-data/public-hostname');
                  - |2
                          $hostname = curl_exec($curl_handle);
                  - |2
                          if (empty($hostname))
                  - |2
                          {
                  - |2
                            print "Sorry, for some reason, we got no hostname back <br />";
                  - |2
                          }
                  - |2
                          else
                  - |2
                          {
                  - |2
                            print "Server = " . $hostname . "<br />";
                  - |2
                          }
                  - |2
                          // Get the instance-id of the intance from the instance metadata
                  - |2
                          curl_setopt($curl_handle,CURLOPT_URL,'http://169.254.169.254/latest/meta-data/instance-id');
                  - |2
                          $instanceid = curl_exec($curl_handle);
                  - |2
                          if (empty($instanceid))
                  - |2
                          {
                  - |2
                            print "Sorry, for some reason, we got no instance id back <br />";
                  - |2
                          }
                  - |2
                          else
                  - |2
                          {
                  - |2
                            print "EC2 instance-id = " . $instanceid . "<br />";
                  - |2
                          }
                  - |2
                          $Database   = "localhost";
                  - '      $DBUser     = "'
                  - !Ref DBUser
                  - |
                    ";
                  - '      $DBPassword = "'
                  - !Ref DBPassword
                  - |
                    ";
                  - |2
                          print "Database = " . $Database . "<br />";
                  - |2
                          $dbconnection = mysql_connect($Database, $DBUser, $DBPassword)
                  - |2
                                          or die("Could not connect: " . mysql_error());
                  - |2
                          print ("Connected to $Database successfully");
                  - |2
                          mysql_close($dbconnection);
                  - |2
                        ?>
                  - |2
                        <h2>PHP Information</h2>
                  - |2
                        <p/>
                  - |2
                        <?php
                  - |2
                          phpinfo();
                  - |2
                        ?>
                  - |2
                      </body>
                  - |
                    </html>
              mode: '000600'
              owner: apache
              group: apache
            /tmp/setup.mysql:
              content: !Sub |
                CREATE DATABASE ${DBName};
                GRANT ALL ON ${DBName}.* TO '${DBUser}'@localhost IDENTIFIED BY '${DBPassword}';
              mode: '000400'
              owner: root
              group: root
            /etc/cfn/cfn-hup.conf:
              content: !Sub |
                [main]
                stack=${AWS::StackId}
                region=${AWS::Region}
                interval=1
              mode: '000400'
              owner: root
              group: root
            /etc/cfn/hooks.d/cfn-auto-reloader.conf:
              content: !Sub |-
                [cfn-auto-reloader-hook]
                triggers=post.update,post.add
                path=Resources.WebServerInstance.Metadata.AWS::CloudFormation::Init
                action=/opt/aws/bin/cfn-init -v --stack ${AWS::StackName} --resource WebServerInstance --configsets InstallAndRun --region ${AWS::Region}
                runas=root
              mode: '000400'
              owner: root
              group: root
          services:
            sysvinit:
              mysqld:
                enabled: 'true'
                ensureRunning: 'true'
              httpd:
                enabled: 'true'
                ensureRunning: 'true'
              # Habilitación del servicio cfh-hup, que escucha cambios en el Metadata
              cfn-hup:
                enabled: 'true'
                ensureRunning: 'true'
                files:
                  - /etc/cfn/cfn-hup.conf
                  - /etc/cfn/hooks.d/cfn-auto-reloader.conf
        Configure:
          commands:
            01_set_mysql_root_password:
              command: !Sub |-
                mysqladmin -u root password '${DBRootPassword}'
              test: !Sub |-
                $(mysql ${DBName} -u root --password='${DBRootPassword}' >/dev/null 2>&1 </dev/null); (( $? != 0 ))
            02_create_database:
              command: !Sub |-
                mysql -u root --password='${DBRootPassword}' < /tmp/setup.mysql
              test: !Sub |-
                $(mysql ${DBName} -u root --password='${DBRootPassword}' >/dev/null 2>&1 </dev/null); (( $? != 0 ))
    Properties:
      IamInstanceProfile: !Ref MyInstanceProfile
      ImageId: !FindInMap 
        - AWSRegionArch2AMI
        - !Ref 'AWS::Region'
        - !FindInMap 
          - AWSInstanceType2Arch
          - !Ref InstanceType
          - Arch
      InstanceType: !Ref InstanceType
      SecurityGroups:
        - !Ref WebServerSecurityGroup
      UserData: !Base64
        Fn::Sub: |-
          #!/bin/bash -xe
          yum update -y aws-cfn-bootstrap
          # Aplicar la configuración definida en la sección Metadata
          /opt/aws/bin/cfn-init -v --stack ${AWS::StackName} --resource WebServerInstance --configsets InstallAndRun --region ${AWS::Region}
          # Enviar señal a CloudFormation con el código de éxito/error del comando cfn-init
          /opt/aws/bin/cfn-signal -e $? --stack ${AWS::StackName} --resource WebServerInstance --region ${AWS::Region}
    CreationPolicy:
      ResourceSignal:
        Timeout: PT5M
  MyInstanceProfile:
    Type: "AWS::IAM::InstanceProfile"
    Properties: 
      Path: "/"
      Roles: 
        - "LabRole"
  WebServerSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Enable HTTP access via port 80
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: '80'
          ToPort: '80'
          CidrIp: 0.0.0.0/0
        - IpProtocol: tcp
          FromPort: '22'
          ToPort: '22'
          CidrIp: !Ref SSHLocation
Outputs:
  WebsiteURL:
    Description: URL for newly created LAMP stack
    Value: !Join 
      - ''
      - - 'http://'
        - !GetAtt 
          - WebServerInstance
          - PublicDnsName
```

</details>

## Parámetros

Los parámetros permiten la configuración de los recursos con datos proporcionados por el usuario que despliegue la plantilla. Esta plantilla incluye los siguientes:

- `DBName` - Nombre de la base de datos
- `DBUser` - Usuario de la base de datos
- `DBPassword` - Contraseña del usuario de la base de datos
- `DBRootPassword` - Contraseña del usuario `root` de la base de datos
- `InstanceType` - Tipo de instancia. Incluye una **lista de valores válidos**.
- `SSHLocation` - Rango de IPs desde el que se permitirá la conexión por SSH a la máquina

## Mappings
Son parejas **clave-valor** que permiten seleccionar determinados valores en función de determinadas dependencias o condiciones. En esta tenemos definidos los siguientes:

- `AWSInstanceType2Arch` - Relaciona el tipo de instancia con una arquitectura
- `AWSRegionArch2Ami` - Relaciona una región con una AMI

De esta manera, dependiendo de la región donde se lance la plantilla, se elegirá la AMI adecuada: recordemos que las AMIs de los mismos sistemas tienen identificadores distintos en regiones distintas.

## Recursos
Los recursos que se crearán son:

- **Instancia** - Incluye una sección `Metadata` que analizaremos a continuación, así como las siguientes **propiedades**:
  - AMI - Especificada en la sección *Mappings* (Amazon Linux)
  - Tipo - Indicado en el parámetro `InstanceType`
  - Grupo de seguridad - Referencia al que creará la plantilla como recurso adicional
  - Perfil de la instancia - Referencia al que creará la plantilla como recurso adicional
  - `UserData` - Script de inicio que configurará los *helper scripts* de CloudFormation
-   **Perfil de la instancia** - Para asociar un rol de ejecución a la instancia (en el caso de Academy, `LabRole`)
- **Grupo de seguridad** - Permite la conexión por:
  - SSH - Desde el rango de IPs indicado en el parámetro `SSHLocation`
  - HTTP - Desde cualquier IP


## Sección `Metadata` y propiedad `UserData` de la instancia

La sección `Metadata` de la instancia incluye una sección `AWS::CloudFormation::Init:`, que utilizará el script `cfn-init`. Puedes encontrar más detalles sobre esta sección en <https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-init.html>.

Esta sección se combina con un conjunto de comandos, denominados **helper scripts**, que se pueden instalar en la instancia mediante el paquete `aws-cfn-bootstrap`.

Puedes comprobar que se definen un conjunto de `configSets`, que establecen un conjunto de **acciones**, entre las que podemos destacar:

- `packages` - Para instalar paquetes. En nuestro caso, con `yum`
- `files` - Para crear ficheros, indicando su contenido, propietario y permisos
- `services` - Permite habilitar y arrancar servicios
- `commands` - Para ejecutar comandos

En el caso que nos ocupa, hay dos `configSets`, cuyos objetivos son:

- Configurar el servidor Apache, junto con PHP y MySQL
- Crear los usuarios de la base de datos
- Crear la base de datos
- Habilitar los servicios de servidor web, base de datos y el **servicio adicional** `cfn-hup` que comentaremos a continuación

La sección `Metadata` define la **configuración deseada de la instancia**. Dicha configuración será aplicada cuando se ejecute el script `cfn-init`, un **helper script** o script auxiliar que podemos ejecutar en nuestra instancia.

En nuestro caso, ejecutaremos dicho script en **dos situaciones**:

1.  **Al crear la instancia**, mediante el script presente en la propiedad `UserData`.
    
    ```yaml
    UserData: !Base64
      Fn::Sub: |-
        #!/bin/bash -xe
        yum update -y aws-cfn-bootstrap
        # Aplicar la configuración definida en la sección Metadata
        /opt/aws/bin/cfn-init -v --stack ${AWS::StackName} --resource WebServerInstance --configsets InstallAndRun --region ${AWS::Region}
        # Enviar señal a CloudFormation con el código de éxito/error del comando cfn-init
        /opt/aws/bin/cfn-signal -e $? --stack ${AWS::StackName} --resource WebServerInstance --region ${AWS::Region}
    ```
    
    Como puede verse, en primer lugar se instalará el paquete `aws-cfn-bootstrap`, que instala los helper scripts de CloudFormation. A continuación, se ejecuta `cfn-init`, para **aplicar la configuración** definida en la sección `Metadata`. Por último, se ejecutará `cfn-signal`, que enviará el resultado de la ejecución de la instrucción anterior para que CloudFormation valide si la configuración se ha realizado con éxito o no:
    
    ```yaml
    CreationPolicy:
      ResourceSignal:
        Timeout: PT5M
    ```
    
    De esta manera, para que CloudFormation considere el recurso como **creado con éxito**, debe **recibir una señal en un plazo de 15 minutos** (`PT5M`). Por tanto, el comando `cfn-init` no debe emitir ningún error (debe completarse con éxito y aplicar toda la configuración definida en el `Metadata`) para que `cfn-signal` emita dicha señal de éxito. Tienes más información sobre `CreationPolicy` aquí: <https://docs.aws.amazon.com/es_es/AWSCloudFormation/latest/UserGuide/aws-attribute-creationpolicy.html>
2.  **Al actualizarse la sección Metadata** como resultado de realizar una **actualización del stack** de CloudFormation enviando una **actualización de la plantilla**. Ello se consigue **instalando el servicio** `cfn-hup`, que se encarga de **detectar cambios en la sección Metadata** del stack al que pertenece la máquina EC2. Efectivamente, mediante `cfn-init`, en su primera ejecución lanzada desde el `UserData`, se instalan los siguientes **ficheros**:
    
    ```yaml
    /etc/cfn/cfn-hup.conf:
      content: !Sub |
        [main]
        stack=${AWS::StackId}
        region=${AWS::Region}
        interval=1
      mode: '000400'
      owner: root
      group: root
    /etc/cfn/hooks.d/cfn-auto-reloader.conf:
      content: !Sub |-
        [cfn-auto-reloader-hook]
        triggers=post.update,post.add
        path=Resources.WebServerInstance.Metadata.AWS::CloudFormation::Init
        action=/opt/aws/bin/cfn-init -v --stack ${AWS::StackName} --resource WebServerInstance --configsets InstallAndRun --region ${AWS::Region}
        runas=root
      mode: '000400'
      owner: root
      group: root
    ```
    
    Estos ficheros crean una configuración para **relanzar el comando** `cfn-init` cuando el servicio `cfn-hup` detecta un cambio en la sección `Metadata`. Observa que hemos añadido el parámetro `interval=1` para que `cfn-hup` realice las comprobaciones cada minuto y podamos comprobar el funcionamiento de manera rápida (el tiempo por defecto es de 15 minutos). Por último, puedes ver cómo se habilita el servicio aquí:
    
    ```yaml
    services:
      sysvinit:
        mysqld:
          enabled: 'true'
          ensureRunning: 'true'
        httpd:
          enabled: 'true'
          ensureRunning: 'true'
        # Habilitación del servicio cfh-hup, que escucha cambios en el Metadata
        cfn-hup:
          enabled: 'true'
          ensureRunning: 'true'
          files:
            - /etc/cfn/cfn-hup.conf
            - /etc/cfn/hooks.d/cfn-auto-reloader.conf
    ```

Tienes más detalles sobre dichos scripts en <https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-helper-scripts-reference.html>

## Tareas propuestas
- Desplegar una actualización del stack **cambiando el tipo de instancia**. ¿Qué ocurre? ¿Se reemplaza o se apaga y se vuelve a conectar? (Básico)
- Realizar una modificación de la sección `Metadata` de la plantilla, creando un **archivo nuevo con tu nombre y apellidos** y comprobar que se crea automáticamente en la instancia cuando se sube de nuevo para actualizar el stack. (Básico)
- Modificar la plantilla para añadir una **base de datos en RDS** y conectarla mediante **helper scripts** a la máquina EC2. (Avanzado)
- Sobre esta última opción, añadir una configuración a la plantilla para realizar una copia de seguridad de la base de datos antes de eliminarse (Avanzado).


## Entrega
Documenta la realización de la práctica explicando los pasos seguidos. Incluye las **capturas de pantalla** necesarias. Recuerda mostrar tus datos personales (nombre y apellidos y/o iniciales) en aquellos apartados donde se indique.

## Limpieza
Al finalizar, **elimina los recursos creados** en la práctica ** eliminando el stack** creado.
