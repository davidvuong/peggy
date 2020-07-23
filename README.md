# peggy

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Code style: airbnb](https://img.shields.io/badge/code%20style-airbnb-blue.svg)](https://github.com/airbnb/javascript)

**Welcome to peggy!**

Peggy is a CLI that helps you manages Terraform variables stored and loaded via JSON files. The primary purpose is to help automate the process of viewing and selecting Docker images from registries such as DockerHub or AWS ECR. It was inspired based on work done in a separate tool [mimiron](https://github.com/davidvuong/mimiron) with similar goals. Since then the landscape has changed significantly.

## Installation

```bash
yarn global add @voltronstudio/peggy
```

Usage:

```bash
# Fetch the current status of your state by parsing your config
peg status

# Fetch the current status for a specific service
peg status <service>

# Fetch images in registry to deploy, targets production, and commits without pushing
peg deploy <service> --env=production

# Fetches images in ECR to deploy, using the default env, commits, and pushes
peg deploy <service> --push
```

## Development

Clone the repository:

```bash
git clone git@github.com:voltronstudio/peggy.git
```

Install dependencies:

```bash
yarn
```

Run tests:

```bash
yarn test
yarn test:coverage
```
