import { htmlSnapshotsDiff } from '../support/htmlSnapshotsDiff';

const fileName = "histogram"

describe(fileName + ' spec', () => {
  it("should be the same image as from snapshots/base", () => { 
    htmlSnapshotsDiff(fileName);
  })
})
