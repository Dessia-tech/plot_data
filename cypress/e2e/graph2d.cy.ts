import { htmlSnapshotsDiff } from '../support/htmlSnapshotsDiff';

const fileName = "graph2d"

describe(fileName + ' spec', () => {
  it("should be the same image as from snapshots/base", () => { 
    htmlSnapshotsDiff(fileName);
  })
})
