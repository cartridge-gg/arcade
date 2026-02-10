/**
 * Collection address mappings per project.
 * Extracted from torii config files in configs/.
 * Used to filter inventory by collection_address when browsing a specific game.
 */

export type ProjectCollections = Record<string, string[]>;

export const PROJECT_COLLECTIONS: ProjectCollections = {
  "arcade-darkshuffle": [
    "0x1e1c477f2ef896fd638b50caa31e3aa8f504d5c6cb3c09c99cd0b72523f07f7",
  ],
  "arcade-dragark": [
    "0x51d0844f96f86c7363cc7eb3ab939e0ef5b70939dcbc17895b2fa178d9af420",
    "0x537fa10cefbb8ff7e61e86e950746809f95faa7398f250f0063069b29bb7933",
  ],
  "arcade-eternum-s0": [
    "0x57675b9c0bd62b096a2e15502a37b290fa766ead21c33eda42993e48a714b80",
    "0x7ae27a31bb6526e3de9cf02f081f6ce0615ac12a6d7b85ee58b8ad7947a2809",
  ],
  "arcade-eternum-s1": [
    "0x60e8836acbebb535dfcd237ff01f20be503aae407b67bb6e3b5869afae97156",
    "0x7ad410c472c1d61ce318dd617a479c977c85275afbf7991a1e1461ffe626a3d",
    "0x7ae27a31bb6526e3de9cf02f081f6ce0615ac12a6d7b85ee58b8ad7947a2809",
    "0x572fe34a769058c62a66f0c4854d08ccfd21fcbb4f0b1685a1868b84c6ee266",
  ],
  "arcade-ls1": [
    "0x018108b32cea514a78ef1b0e4a0753e855cdf620bc0565202c02456f618c4dc4",
    "0x04f5e296c805126637552cf3930e857f380e7c078e8f00696de4fc8545356b1d",
    "0x0158160018d590d93528995b340260e65aedd76d28a686e9daa5c4e8fad0c5dd",
  ],
  "arcade-ls2": [
    "0x036017e69d21d6d8c13e266eabb73ef1f1d02722d86bdcabe5f168f8e549d3cd",
    "0x046da8955829adf2bda310099a0063451923f02e648cf25a1203aac6335cf0e4",
    "0x027838dea749f41c6f8a44fcfa791788e6101080c1b3cd646a361f653ad10e2d",
  ],
  "arcade-ls2-bis": [
    "0x036017e69d21d6d8c13e266eabb73ef1f1d02722d86bdcabe5f168f8e549d3cd",
    "0x046da8955829adf2bda310099a0063451923f02e648cf25a1203aac6335cf0e4",
    "0x027838dea749f41c6f8a44fcfa791788e6101080c1b3cd646a361f653ad10e2d",
  ],
  "arcade-pistols": [
    "0x2e9c711b1a7e2784570b1bda5082a92606044e836ba392d2b977d280fb74b3c",
    "0x7aaa9866750a0db82a54ba8674c38620fa2f967d2fbb31133def48e0527c87f",
    "0x71333ac75b7d5ba89a2d0c2b67d5b955258a4d46eb42f3428da6137bbbfdfd9",
    "0x14aa76e6c6f11e3f657ee2c213a62006c78ff2c6f8ed40b92c42fd554c246f2",
  ],
  "arcade-ponziland-nft": [
    "0x0413485dbeccec6320d35dcba14375e7ca973f021486496a61286edb958fd861",
    "0x04fa864a706e3403fd17ac8df307f22eafa21b778b73353abf69a622e47a2003",
    "0x02acee8c430f62333cf0e0e7a94b2347b5513b4c25f699461dd8d7b23c072478",
    "0x00539f522b29ae9251dbf7443c7a950cf260372e69efab3710a11bf17a9599f1",
  ],
  "arcade-zkube-v2": [
    "0x4fd5df500e6c6615e4423258639f189455672bc841ba58f1c781ac7c5ff4bd8",
  ],
};

/**
 * Get collection addresses for a given project.
 * Returns undefined if the project has no known collections.
 */
export function getProjectCollections(project: string): string[] | undefined {
  return PROJECT_COLLECTIONS[project];
}

/**
 * Check if a collection address belongs to a specific project.
 */
export function isCollectionInProject(
  project: string,
  collectionAddress: string,
): boolean {
  const collections = PROJECT_COLLECTIONS[project];
  if (!collections) return false;
  return collections.includes(collectionAddress.toLowerCase());
}
