import { ECR } from 'aws-sdk';
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

  getImagesByRepository = async (repository: Repository): Promise<Image[]> => {
    const response = await this.client.describeImages({ repositoryName: repository.name, maxResults: 100 }).promise();
    return (response.imageDetails ?? []).map(({ imageDigest, imageTags, imageSizeInBytes, imagePushedAt }) => ({
      digest: imageDigest as string,
      tags: imageTags as string[],
      sizeInBytes: imageSizeInBytes as number,
      pushedAt: imagePushedAt as Date,
    }));
  };
}
