import { ECR } from 'aws-sdk';
import { take, sortBy } from 'lodash';
import { Repository } from '../typed/core/Repository';
import { Image } from '../typed/core/Image';

export class AwsEcrRegistryService {
  constructor(private readonly client: ECR) {}

  getRepositories = async (): Promise<Repository[]> => {
    const response = await this.client.describeRepositories().promise();
    return (response.repositories ?? []).map(({ repositoryName, repositoryUri }) => ({
      name: repositoryName as string,
      uri: repositoryUri as string,
    }));
  };

  getImagesByRepository = async (repository: Repository, maxResults: number): Promise<Image[]> => {
    const response = await this.client
      .describeImages({ repositoryName: repository.name, maxResults: 500, filter: { tagStatus: 'TAGGED' } })
      .promise();
    const images = (response.imageDetails ?? []).map(({ imageDigest, imageTags, imageSizeInBytes, imagePushedAt }) => ({
      digest: imageDigest as string,
      tags: imageTags as string[],
      sizeInBytes: imageSizeInBytes as number,
      pushedAt: imagePushedAt as Date,
    }));
    return take(
      sortBy(images, i => -i.pushedAt),
      maxResults,
    );
  };
}
