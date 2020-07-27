export interface Image {
  digest: string;
  tags: string[];
  sizeInBytes: number;
  pushedAt: Date;
}
