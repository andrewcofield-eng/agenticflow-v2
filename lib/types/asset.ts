export type Asset = {
  id: string;
  title: string;
  assetType: string;
  tags: string[];
  associatedProducts: string[];
  audienceFit: string[];
  channelSuitability: string[];
  toneStyle: string;
  usageStatus: string;
  campaignFit: string[];
  imageUrl?: string;
  publicId?: string;
  cloudName?: string;
};
