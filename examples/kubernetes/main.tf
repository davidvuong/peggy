terraform {
  backend "s3" {}
}

provider "kubernetes" {}

locals {
  env = {
    development-kubernetes = {
      environment = "development"
      region      = "ap-southeast-2"
    }

    qa-kubernetes = {
      environment = "qa"
      region      = "ap-southeast-2"
    }
  }

  // @see: https://discuss.hashicorp.com/t/how-to-work-with-json/2345
  vars      = jsondecode(file("${path.module}/variables/${local.workspace.environment}.json"))
  workspace = local.env[terraform.workspace]

  service   = local.vars.apps.web
  container = local.vars.apps.web.containers
}

resource "kubernetes_deployment" "web" {
  metadata {
    name = "web"
    labels = {
      app = "web"
    }
  }

  spec {
    replicas = local.service.replicas
    selector {
      match_labels = {
        app = "web"
      }
    }

    template {
      metadata {
        labels = {
          app = "web"
        }
      }

      spec {
        container {
          image = local.container.image
          name  = "web"

          env {
            name  = "LOG_LEVEL"
            value = local.container.env.LOG_LEVEL
          }

          env {
            name  = "HTTP_PORT"
            value = local.container.env.HTTP_PORT
          }

          resources {
            limits {
              cpu    = local.container.resources.limits.cpu
              memory = local.container.resources.limits.memory
            }
            requests {
              cpu    = local.container.resources.requests.cpu
              memory = local.container.resources.requests.memory
            }
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "web" {
  metadata {
    name = "web"
  }

  spec {
    selector = {
      app = kubernetes_deployment.web.metadata[0].name
    }

    external_traffic_policy = "Local"
    type                    = "LoadBalancer"

    port {
      port        = 443
      target_port = tonumber(local.container.env.HTTP_PORT)
    }
  }
}
