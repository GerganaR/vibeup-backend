import { eventService } from "../event.service";
import { eventRepository } from "../event.repository";
import { sequelize } from "@/core/config/database";
import { EventPolicy } from "../event.policy";
import { EventRules } from "../event.rules";

jest.mock("../event.repository");
jest.mock("@/core/config/database", () => ({
  sequelize: {
    transaction: jest.fn((fn) => fn({})),
  },
}));

jest.spyOn(EventPolicy, "ensureHost").mockImplementation(() => {});
jest.spyOn(EventRules, "validateDates").mockImplementation(() => {});
jest.spyOn(EventRules, "ensureNoDuplicateCohosts").mockImplementation(() => {});
jest.spyOn(EventRules, "ensureCohostNotHost").mockImplementation(() => {});

describe("EventService.updateEvent()", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws NotFoundError when event does not exist", async () => {
    jest.spyOn(eventRepository, "findById").mockResolvedValue(null);

    await expect(
      eventService.updateEvent("event1", {}, "user1")
    ).rejects.toThrow("Event not found");
  });

  it("adds new cohosts correctly", async () => {
    jest.spyOn(eventRepository, "findById").mockResolvedValue({
      id: "event1",
      hostId: "user1",
      cohosts: [{ userId: "existing", eventId: "event1" } as any],
    } as any);

    jest
      .spyOn(eventRepository, "updateById")
      .mockResolvedValue(undefined as any);

    const addSpy = jest
      .spyOn(eventRepository, "addCohosts")
      .mockResolvedValue(undefined as any);

    const deleteSpy = jest
      .spyOn(eventRepository, "deleteCohosts")
      .mockResolvedValue(undefined as any);

    await eventService.updateEvent(
      "event1",
      { cohostIds: ["existing", "new1"] },
      "user1"
    );

    expect(addSpy).toHaveBeenCalledWith(
      [{ eventId: "event1", userId: "new1" }],
      expect.any(Object)
    );

    // Should NOT delete existing
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("removes deleted cohosts correctly", async () => {
    // Event initially has 2 cohosts: keep + remove
    jest.spyOn(eventRepository, "findById").mockResolvedValue({
      id: "event1",
      hostId: "user1",
      cohosts: [
        { userId: "keep", eventId: "event1" } as any,
        { userId: "remove", eventId: "event1" } as any,
      ],
    } as any);

    jest
      .spyOn(eventRepository, "updateById")
      .mockResolvedValue(undefined as any);

    const deleteSpy = jest
      .spyOn(eventRepository, "deleteCohosts")
      .mockResolvedValue(undefined as any);

    jest
      .spyOn(eventRepository, "addCohosts")
      .mockResolvedValue(undefined as any);

    // DTO includes only "keep"
    await eventService.updateEvent("event1", { cohostIds: ["keep"] }, "user1");

    expect(deleteSpy).toHaveBeenCalledWith(
      "event1",
      expect.objectContaining({
        where: { eventId: "event1", userId: "remove" },
      })
    );
  });

  it("makes no cohost writes when unchanged", async () => {
    jest.spyOn(eventRepository, "findById").mockResolvedValue({
      id: "event1",
      hostId: "user1",
      cohosts: [{ userId: "same", eventId: "event1" } as any],
    } as any);

    jest
      .spyOn(eventRepository, "updateById")
      .mockResolvedValue(undefined as any);

    const addSpy = jest.spyOn(eventRepository, "addCohosts");
    const deleteSpy = jest.spyOn(eventRepository, "deleteCohosts");

    await eventService.updateEvent("event1", { cohostIds: ["same"] }, "user1");

    expect(addSpy).not.toHaveBeenCalled();
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("wraps everything inside a transaction", async () => {
    const txSpy = jest.spyOn(sequelize, "transaction");

    jest.spyOn(eventRepository, "findById").mockResolvedValue({
      id: "event1",
      hostId: "user1",
      cohosts: [],
    } as any);

    jest
      .spyOn(eventRepository, "updateById")
      .mockResolvedValue(undefined as any);

    await eventService.updateEvent("event1", { cohostIds: [] }, "user1");

    expect(txSpy).toHaveBeenCalled();
  });
});
