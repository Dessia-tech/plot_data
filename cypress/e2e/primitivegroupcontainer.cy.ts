import { htmlSnapshotsDiff } from '../support/htmlSnapshotsDiff';

const fileName = "primitivegroupcontainer"

describe(fileName + ' spec', () => {
  it("should be the same image as from snapshots/base", () => { 
    htmlSnapshotsDiff(fileName);
  })
})
