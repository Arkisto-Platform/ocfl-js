const { OcflStorageLayout } = require("../extension");
const { OcflDigest } = require("../digest");
const path = require("path");

const DefaultConfig = {
  extensionName: '0004-hashed-n-tuple-storage-layout',
  digestAlgorithm: 'sha256',
  tupleSize: 3,
  numberOfTuples: 3,
  shortObjectRoot: false
};

class HashedNTupleStorageLayout extends OcflStorageLayout {
  static get NAME() { return DefaultConfig.extensionName }
  static get DESCRIPTION() {
    return "OCFL object identifiers are hashed and encoded as lowercase hex strings." +
      " These digests are then divided into N n-tuple segments," +
      " which are used to create nested paths under the OCFL storage root.";
  }

  constructor(config) {
    /** @type {DefaultConfig} */
    let c = Object.assign(Object.create(DefaultConfig), config);
    if (!OcflDigest.FIXITY.of(c.digestAlgorithm)) throw new Error('Invalid digestAlgorithm');
    let digest = OcflDigest.digestSync(c.digestAlgorithm, 'test');
    let p = c.numberOfTuples * c.tupleSize
    if (p > digest.length) throw new Error('Product of numberOfTuples and tupleSize is greater than the number of characters in the hex encoded digest.');
    else if (p === digest.length && c.shortObjectRoot) throw new Error('shortObjectRoot cannot be set to true');
    super(c);
  }

  /**
   * @param {string} id
   * @return {string} 
   */
  map(id) {
    let digest = OcflDigest.digestSync(this.config.digestAlgorithm, id);
    let segments = [];
    let s = this.config.tupleSize;
    let n = this.config.numberOfTuples;
    let i;
    for (i = 0; i < n; ++i) {
      segments.push(digest.slice(s * i, s * i + s));
    }
    if (this.config.shortObjectRoot) {
      segments.push(digest.slice(s * i));
    } else {
      segments.push(digest);
    }
    return segments.join(path.sep);
  }

}

module.exports = { HashedNTupleStorageLayout };