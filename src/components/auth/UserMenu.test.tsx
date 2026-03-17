import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserMenu } from "./UserMenu";
import { useAuthStore } from "@/store/authStore";
import { useTeamStore } from "@/store/teamStore";

vi.mock("@/store/authStore", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/store/teamStore", () => ({
  useTeamStore: vi.fn(),
  subscribeToTeamMembers: vi.fn(() => vi.fn()),
  unsubscribeFromTeamMembers: vi.fn(),
}));

vi.mock("@/components/team", () => ({
  TeamMembers: () => <div data-testid="team-members" />,
  InviteDialog: () => <div data-testid="invite-dialog" />,
  IntegratedTeamManagementSheet: ({
    teamId,
    open,
  }: {
    teamId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) => (
    <div data-testid="integrated-team-management" data-open={open}>
      Team Management for {teamId}
    </div>
  ),
}));

const mockLogout = vi.fn();

function setupStores(overrides: { user?: unknown; team?: unknown } = {}) {
  const hasUser = "user" in overrides;
  vi.mocked(useAuthStore).mockReturnValue({
    user: hasUser
      ? overrides.user
      : {
          uid: "u1",
          email: "test@example.com",
          displayName: "Test User",
        },
    logout: mockLogout,
    loading: false,
  } as ReturnType<typeof useAuthStore>);

  vi.mocked(useTeamStore).mockReturnValue({
    currentTeam: overrides.team ?? null,
    currentTeamId: overrides.team ? "team-1" : null,
  } as ReturnType<typeof useTeamStore>);
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("UserMenu", () => {
  it("renders nothing when user is null", () => {
    setupStores({ user: null });
    const { container } = render(<UserMenu />);
    expect(container.innerHTML).toBe("");
  });

  it("renders user menu button with display name", () => {
    setupStores();
    render(<UserMenu />);
    expect(screen.getByText("Test User")).toBeInTheDocument();
  });

  it("uses email prefix when displayName is absent", () => {
    setupStores({ user: { uid: "u1", email: "hello@test.com", displayName: null } });
    render(<UserMenu />);
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("opens dropdown on button click", async () => {
    const user = userEvent.setup();
    setupStores();
    render(<UserMenu />);
    await user.click(screen.getByRole("button"));
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByText("로그아웃")).toBeInTheDocument();
  });

  it("calls logout when sign out button is clicked", async () => {
    const user = userEvent.setup();
    mockLogout.mockResolvedValue(undefined);
    setupStores();
    render(<UserMenu />);
    await user.click(screen.getByRole("button"));
    await user.click(screen.getByText("로그아웃"));
    expect(mockLogout).toHaveBeenCalled();
  });

  it("shows team options when currentTeam exists", async () => {
    const user = userEvent.setup();
    setupStores({ team: { id: "team-1", name: "My Team" } });
    render(<UserMenu />);
    await user.click(screen.getByRole("button"));
    expect(screen.getByText("팀 관리")).toBeInTheDocument();
  });

  it("hides team options when no currentTeam", async () => {
    const user = userEvent.setup();
    setupStores({ team: null });
    render(<UserMenu />);
    await user.click(screen.getByRole("button"));
    expect(screen.queryByText("팀 관리")).not.toBeInTheDocument();
  });

  it("closes dropdown when clicking outside", async () => {
    const user = userEvent.setup();
    setupStores();
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <UserMenu />
      </div>
    );
    await user.click(screen.getByRole("button"));
    expect(screen.getByText("로그아웃")).toBeInTheDocument();
    await user.click(screen.getByTestId("outside"));
    expect(screen.queryByText("로그아웃")).not.toBeInTheDocument();
  });
});
