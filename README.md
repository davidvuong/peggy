# peggy

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Code style: airbnb](https://img.shields.io/badge/code%20style-airbnb-blue.svg)](https://github.com/airbnb/javascript)

**Welcome to peggy!**

Peggy (or `peg` for short) is a CLI that helps you manage Terraform variables stored and loaded via JSON files. The primary goal is to ease the workflow necessary to pick and choose images to be used for deployment.

Peggy helps by automating the process of connecting to a Docker registry, finding the image to deploy and updating the necessary files to have Terraform pick up changes. Peggy was inspired by previous work in a [similar tool (Mimiron)](https://github.com/davidvuong/mimiron) with related goals. Since then the landscape has changed significantly and Peggy is the next iteration of the same tooling.

**Supported registeries:**

- ECR
- DockerHub (coming soon)

TODO (INSERT GIF - see: https://gist.github.com/dergachev/4627207)

## Workflow

TODO

## Variables.json

## Installation

```bash
yarn global add @voltronstudio/peggy
```

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

## Configuration

TODO

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

Peggy was built by [Volton Studio](https://www.voltron.studio/).
