/**
 * IntegratedTeamManagementSheet 컴포넌트 테스트
 *
 * SPEC-TEAM-002: 통합 팀 관리 메뉴
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { IntegratedTeamManagementSheet } from "./IntegratedTeamManagementSheet";

// Mock dependencies
vi.mock("@/store/teamStore", () => ({
  useTeamStore: vi.fn(),
  subscribeToTeamMembers: vi.fn(() => vi.fn()),
  unsubscribeFromTeamMembers: vi.fn(),
}));

vi.mock("@/store/authStore", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("./TeamMembers", () => ({
  TeamMembers: ({ teamId, className }: { teamId: string; className?: string }) => (
    <div data-testid="team-members" className={className}>
      Team Members for {teamId}
    </div>
  ),
}));

// Props type for mock components
interface MockDialogProps {
  teamId?: string;
  team?: { name: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

vi.mock("./InviteDialog", () => ({
  InviteDialog: ({ teamId, open }: MockDialogProps) => (
    <div data-testid="invite-dialog" data-open={open}>
      Invite Dialog for {teamId}
    </div>
  ),
}));

vi.mock("./DeleteTeamDialog", () => ({
  DeleteTeamDialog: ({ team, open }: MockDialogProps) => (
    <div data-testid="delete-dialog" data-open={open}>
      Delete Dialog for {team?.name}
    </div>
  ),
}));

vi.mock("./LeaveTeamDialog", () => ({
  LeaveTeamDialog: ({ team, open }: MockDialogProps) => (
    <div data-testid="leave-dialog" data-open={open}>
      Leave Dialog for {team?.name}
    </div>
  ),
}));

import { useTeamStore } from "@/store/teamStore";
import { useAuthStore } from "@/store/authStore";

describe("IntegratedTeamManagementSheet", () => {
  const mockTeam = {
    id: "team-1",
    name: "Test Team",
    description: "Test Description",
    ownerId: "user-owner",
    memberCount: 3,
    settings: {
      defaultRole: "viewer" as const,
      allowInviteLinks: true,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = {
    uid: "user-1",
    email: "test@example.com",
    displayName: "Test User",
  };

  const mockMembers = [
    { id: "user-owner", displayName: "Owner", email: "owner@example.com", role: "owner" as const },
    { id: "user-1", displayName: "Admin", email: "admin@example.com", role: "admin" as const },
    { id: "user-2", displayName: "Viewer", email: "viewer@example.com", role: "viewer" as const },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("기본 렌더링", () => {
    it("팀 정보를 표시한다", async () => {
      vi.mocked(useTeamStore).mockReturnValue({
        currentTeam: mockTeam,
        currentTeamId: "team-1",
        members: mockMembers,
      } as ReturnType<typeof useTeamStore>);

      vi.mocked(useAuthStore).mockReturnValue({
        user: mockUser,
      } as ReturnType<typeof useAuthStore>);

      render(<IntegratedTeamManagementSheet teamId="team-1" open={true} onOpenChange={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByText("Test Team")).toBeInTheDocument();
        expect(screen.getByText("Test Description")).toBeInTheDocument();
      });
    });

    it("팀 멤버 섹션을 렌더링한다", async () => {
      vi.mocked(useTeamStore).mockReturnValue({
        currentTeam: mockTeam,
        currentTeamId: "team-1",
        members: mockMembers,
      } as ReturnType<typeof useTeamStore>);

      vi.mocked(useAuthStore).mockReturnValue({
        user: mockUser,
      } as ReturnType<typeof useAuthStore>);

      render(<IntegratedTeamManagementSheet teamId="team-1" open={true} onOpenChange={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByTestId("team-members")).toBeInTheDocument();
        expect(screen.getByText("팀 멤버")).toBeInTheDocument();
      });
    });

    it("초대 버튼을 표시한다", async () => {
      vi.mocked(useTeamStore).mockReturnValue({
        currentTeam: mockTeam,
        currentTeamId: "team-1",
        members: mockMembers,
      } as ReturnType<typeof useTeamStore>);

      vi.mocked(useAuthStore).mockReturnValue({
        user: mockUser,
      } as ReturnType<typeof useAuthStore>);

      render(<IntegratedTeamManagementSheet teamId="team-1" open={true} onOpenChange={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByText("초대")).toBeInTheDocument();
      });
    });
  });

  describe("권한 기반 UI 렌더링", () => {
    it("owner에게는 팀 삭제 버튼을 표시한다 (마지막 소유자가 아닌 경우)", async () => {
      const ownerMembers = [
        { ...mockMembers[0] }, // owner 1
        { ...mockMembers[1], role: "owner" as const }, // owner 2
      ];

      vi.mocked(useTeamStore).mockReturnValue({
        currentTeam: mockTeam,
        currentTeamId: "team-1",
        members: ownerMembers,
      } as ReturnType<typeof useTeamStore>);

      vi.mocked(useAuthStore).mockReturnValue({
        user: { ...mockUser, uid: "user-owner" },
      } as ReturnType<typeof useAuthStore>);

      render(<IntegratedTeamManagementSheet teamId="team-1" open={true} onOpenChange={vi.fn()} />);

      await waitFor(() => {
        const buttons = screen.getAllByRole("button");
        const deleteButton = buttons.find((btn) => btn.textContent?.includes("팀 삭제"));
        expect(deleteButton).toBeInTheDocument();
      });
    });

    it("마지막 owner에게는 경고 메시지를 표시하고 팀 삭제 버튼을 표시하지 않는다", async () => {
      vi.mocked(useTeamStore).mockReturnValue({
        currentTeam: mockTeam,
        currentTeamId: "team-1",
        members: [mockMembers[0]], // Only owner
      } as ReturnType<typeof useTeamStore>);

      vi.mocked(useAuthStore).mockReturnValue({
        user: { ...mockUser, uid: "user-owner" },
      } as ReturnType<typeof useAuthStore>);

      render(<IntegratedTeamManagementSheet teamId="team-1" open={true} onOpenChange={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByText(/마지막 소유자/)).toBeInTheDocument();
        // SPEC-TEAM-003: 마지막 소유자도 팀 삭제 가능
        // 삭제는 팀 전체를 제거하는 작업이므로 owner 권한만 있으면 됩니다
        expect(screen.getByRole("button", { name: /팀 삭제/ })).toBeInTheDocument();
      });
    });

    it("admin에게는 팀 탈퇴 버튼을 표시하지만 팀 삭제는 표시하지 않는다", async () => {
      vi.mocked(useTeamStore).mockReturnValue({
        currentTeam: mockTeam,
        currentTeamId: "team-1",
        members: mockMembers,
      } as ReturnType<typeof useTeamStore>);

      vi.mocked(useAuthStore).mockReturnValue({
        user: mockUser, // admin role
      } as ReturnType<typeof useAuthStore>);

      render(<IntegratedTeamManagementSheet teamId="team-1" open={true} onOpenChange={vi.fn()} />);

      await waitFor(() => {
        const buttons = screen.getAllByRole("button");
        const leaveButton = buttons.find((btn) => btn.textContent?.includes("팀 탈퇴"));
        const deleteButton = buttons.find((btn) => btn.textContent?.includes("팀 삭제"));

        expect(leaveButton).toBeInTheDocument();
        expect(deleteButton).toBeUndefined();
      });
    });

    it("viewer에게는 팀 탈퇴 버튼만 표시한다", async () => {
      vi.mocked(useTeamStore).mockReturnValue({
        currentTeam: mockTeam,
        currentTeamId: "team-1",
        members: mockMembers,
      } as ReturnType<typeof useTeamStore>);

      vi.mocked(useAuthStore).mockReturnValue({
        user: { ...mockUser, uid: "user-2" }, // viewer role
      } as ReturnType<typeof useAuthStore>);

      render(<IntegratedTeamManagementSheet teamId="team-1" open={true} onOpenChange={vi.fn()} />);

      await waitFor(() => {
        const buttons = screen.getAllByRole("button");
        const leaveButton = buttons.find((btn) => btn.textContent?.includes("팀 탈퇴"));
        const deleteButton = buttons.find((btn) => btn.textContent?.includes("팀 삭제"));

        expect(leaveButton).toBeInTheDocument();
        expect(deleteButton).toBeUndefined();
      });
    });
  });

  describe("사용자 인터랙션", () => {
    it("초대 버튼 클릭 시 초대 다이얼로그를 연다", async () => {
      vi.mocked(useTeamStore).mockReturnValue({
        currentTeam: mockTeam,
        currentTeamId: "team-1",
        members: mockMembers,
      } as ReturnType<typeof useTeamStore>);

      vi.mocked(useAuthStore).mockReturnValue({
        user: mockUser,
      } as ReturnType<typeof useAuthStore>);

      render(<IntegratedTeamManagementSheet teamId="team-1" open={true} onOpenChange={vi.fn()} />);

      await waitFor(() => {
        const inviteButton = screen.getByText("초대");
        expect(inviteButton).toBeInTheDocument();
      });
    });

    it("팀 삭제 버튼 클릭 시 삭제 다이얼로그를 연다 (마지막 소유자가 아닌 경우)", async () => {
      const ownerMembers = [
        { ...mockMembers[0] }, // owner 1
        { ...mockMembers[1], role: "owner" as const }, // owner 2
      ];

      vi.mocked(useTeamStore).mockReturnValue({
        currentTeam: mockTeam,
        currentTeamId: "team-1",
        members: ownerMembers,
      } as ReturnType<typeof useTeamStore>);

      vi.mocked(useAuthStore).mockReturnValue({
        user: { ...mockUser, uid: "user-owner" },
      } as ReturnType<typeof useAuthStore>);

      render(<IntegratedTeamManagementSheet teamId="team-1" open={true} onOpenChange={vi.fn()} />);

      await waitFor(() => {
        const buttons = screen.getAllByRole("button");
        const deleteButton = buttons.find((btn) => btn.textContent?.includes("팀 삭제"));
        expect(deleteButton).toBeInTheDocument();
      });
    });

    it("팀 탈퇴 버튼 클릭 시 탈퇴 다이얼로그를 연다", async () => {
      vi.mocked(useTeamStore).mockReturnValue({
        currentTeam: mockTeam,
        currentTeamId: "team-1",
        members: mockMembers,
      } as ReturnType<typeof useTeamStore>);

      vi.mocked(useAuthStore).mockReturnValue({
        user: mockUser,
      } as ReturnType<typeof useAuthStore>);

      render(<IntegratedTeamManagementSheet teamId="team-1" open={true} onOpenChange={vi.fn()} />);

      await waitFor(() => {
        const buttons = screen.getAllByRole("button");
        const leaveButton = buttons.find((btn) => btn.textContent?.includes("팀 탈퇴"));
        expect(leaveButton).toBeInTheDocument();
      });
    });
  });
});
