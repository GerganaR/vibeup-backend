import { TrackedValueObjectCollection } from "@/core/domain/trackValueObjectCollection";
import { EventCohost } from "@/modules/event/domain/value-objects/EventCohost";

class TestCohostCollection extends TrackedValueObjectCollection<EventCohost> {
  protected getType() {
    return EventCohost as unknown as new (...args: any[]) => EventCohost;
  }
  protected getHash(vo: EventCohost) {
    return vo.userId;
  }
}

describe("TrackedValueObjectCollection", () => {
  const c1 = EventCohost.create("u1");
  const c2 = EventCohost.create("u2");

  it("initializes clean + originalClean on constructor", () => {
    const col = new TestCohostCollection([c1, c2]);

    expect(col.getClean()).toEqual([c1, c2]);
    expect(col.getNew()).toEqual([]);
    expect(col.getRemoved()).toEqual([]);
  });

  it("registerNew adds new items", () => {
    const col = new TestCohostCollection([c1]);

    col.registerNew(c2);

    expect(col.getNew()).toEqual([c2]);
    expect(col.getClean()).toEqual([c1]);
  });

  it("registerNew on clean item throws", () => {
    const col = new TestCohostCollection([c1]);

    expect(() => col.registerNew(c1)).toThrow(
      "Value object is registered as clean!"
    );
  });

  it("registerRemoved removes clean items", () => {
    const col = new TestCohostCollection([c1, c2]);

    col.registerRemoved(c2);

    expect(col.getRemoved()).toEqual([c2]);
    expect(col.getClean()).toEqual([c1]);
  });

  it("registerRemoved deletes new items instead of moving to removed", () => {
    const col = new TestCohostCollection([c1]);

    col.registerNew(c2);
    col.registerRemoved(c2);

    expect(col.getRemoved()).toEqual([]);
    expect(col.getNew()).toEqual([]);
    expect(col.getClean()).toEqual([c1]);
  });

  it("has() returns true only for clean + new items", () => {
    const col = new TestCohostCollection([c1]);

    col.registerNew(c2);
    col.registerRemoved(c1);

    expect(col.has(c1)).toBe(false); // removed
    expect(col.has(c2)).toBe(true); // new
  });

  it("registerAllAsRemoved marks everything as removed", () => {
    const col = new TestCohostCollection([c1, c2]);

    col.registerAllAsRemoved();

    expect(col.getRemoved()).toEqual([c1, c2]);
    expect(col.getClean()).toEqual([]);
    expect(col.getNew()).toEqual([]);
  });

  it("adding then removing then adding again restores to clean (original snapshot behavior)", () => {
    const col = new TestCohostCollection([c1]);

    // remove original
    col.registerRemoved(c1);
    expect(col.getRemoved()).toEqual([c1]);

    // re-add same VO → should be clean (not new)
    col.registerNew(c1);

    expect(col.getClean()).toEqual([c1]);
    expect(col.getNew()).toEqual([]);
    expect(col.getRemoved()).toEqual([]);
  });
});
