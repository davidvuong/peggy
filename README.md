# peggy

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Code style: airbnb](https://img.shields.io/badge/code%20style-airbnb-blue.svg)](https://github.com/airbnb/javascript)

**Welcome to peggy!**

Peggy is a CLI that helps you manages Terraform variables stored and loaded via JSON files. The primary purpose is to help automate the process of viewing and selecting Docker images from registries such as DockerHub or AWS ECR. It was inspired based on work done in a separate tool [mimiron](https://github.com/davidvuong/mimiron) with similar goals. Since then the landscape has changed significantly.

## Installation

```bash
yarn global add @voltronstudio/peggy
```

We also provide a Docker image so installation isn't necessary:

```bash
docker run -it --rm -v $(pwd)/:/app -w /app voltronstudio/peggy:latest status
```

The `ENTRYPOINT` is the executable `peg`. See the Dockerfile for more details.

## Usage

```
# Fetch the current status of your state by parsing your config
peg status

# Fetch the current status for a specific app
peg status <app>

# Fetch images in registry to deploy, targets production, and commits without pushing
peg bump <app> --env=production

# Fetches images in ECR to deploy, using the default env, commits, and pushes
peg bump <app> --push

# Fetches images from a differently name repository (by default it uses the same name as <app>)
peg bump <app> <repository>

# See help for more details
peg --help
peh <command> --help
```

## Development

Clone the repository:

```bash
git clone git@github.com:voltronstudio/peggy.git
```

Install dependencies:

```bash
yarn

yarn build
yarn start
```

Run tests:

```bash
yarn test
yarn test:coverage
```
