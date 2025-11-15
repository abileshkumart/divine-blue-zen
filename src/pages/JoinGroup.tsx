import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Lock, Globe, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface GroupInfo {
  id: string;
  name: string;
  description: string;
  group_type: string;
  member_count: number;
  member_limit: number;
  is_private: boolean;
  created_by: string;
}

const JoinGroup = () => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [group, setGroup] = useState<GroupInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [alreadyMember, setAlreadyMember] = useState(false);

  useEffect(() => {
    if (!inviteCode) {
      setError("Invalid invite link");
      setLoading(false);
      return;
    }

    loadGroupInfo();
  }, [inviteCode]);

  const loadGroupInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch group by invite code
      const { data: groupData, error: groupError } = await supabase
        .from("practice_groups" as any)
        .select("*")
        .eq("invite_code", inviteCode)
        .single();

      if (groupError || !groupData) {
        setError("Group not found. The invite link may be invalid or expired.");
        setLoading(false);
        return;
      }

      setGroup(groupData as any);

      // Check if user is already a member
      if (user) {
        const { data: memberData } = await supabase
          .from("group_members" as any)
          .select("id")
          .eq("group_id", (groupData as any).id)
          .eq("user_id", user.id)
          .single();

        if (memberData) {
          setAlreadyMember(true);
        }
      }
    } catch (err) {
      console.error("Error loading group:", err);
      setError("Failed to load group information");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!user) {
      toast.error("Please sign in to join groups", {
        description: "Redirecting to login...",
      });
      setTimeout(() => navigate("/auth"), 1500);
      return;
    }

    if (!group) return;

    // Check if group is full
    if (group.member_count >= group.member_limit) {
      toast.error("Group is full", {
        description: "This group has reached its member limit",
      });
      return;
    }

    try {
      setJoining(true);

      // Join the group
      const { error: joinError } = await supabase
        .from("group_members" as any)
        .insert({
          group_id: group.id,
          user_id: user.id,
          role: "member",
        });

      if (joinError) {
        if (joinError.code === "23505") {
          toast.error("Already a member", {
            description: "You're already part of this group",
          });
        } else {
          throw joinError;
        }
        return;
      }

      toast.success("Welcome to the group! 🎉", {
        description: `You've joined ${group.name}. You'll be auto-enrolled in active challenges.`,
      });

      // Redirect to community page after 1.5 seconds
      setTimeout(() => {
        navigate("/community");
      }, 1500);
    } catch (err) {
      console.error("Error joining group:", err);
      toast.error("Failed to join group", {
        description: "Please try again later",
      });
    } finally {
      setJoining(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "meditation":
        return "bg-purple-500";
      case "yoga":
        return "bg-blue-500";
      case "breathing":
        return "bg-cyan-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            <p className="text-gray-600">Loading group information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Card className="w-full max-w-md mx-4 border-red-200">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <CardTitle className="text-center text-red-600">Group Not Found</CardTitle>
            <CardDescription className="text-center">
              {error || "The invite link may be invalid or expired."}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate("/community")} variant="outline">
              Go to Community
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (alreadyMember) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Card className="w-full max-w-md mx-4 border-green-200">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <CardTitle className="text-center text-green-600">Already a Member</CardTitle>
            <CardDescription className="text-center">
              You're already part of {group.name}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate("/community")}>
              Go to Community
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const isFull = group.member_count >= group.member_limit;
  const spotsRemaining = group.member_limit - group.member_count;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">{group.name}</CardTitle>
          <CardDescription className="text-center">
            You've been invited to join this practice group
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Description */}
          {group.description && (
            <div className="text-sm text-gray-600 text-center">
              {group.description}
            </div>
          )}

          {/* Badges */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Badge className={`${getTypeColor(group.group_type)} text-white`}>
              {group.group_type.charAt(0).toUpperCase() + group.group_type.slice(1)}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              {group.is_private ? (
                <>
                  <Lock className="h-3 w-3" />
                  Private
                </>
              ) : (
                <>
                  <Globe className="h-3 w-3" />
                  Public
                </>
              )}
            </Badge>
          </div>

          {/* Member Count */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Members</span>
              <span className="font-medium">
                {group.member_count} / {group.member_limit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full ${
                  isFull ? "bg-red-500" : "bg-blue-500"
                } transition-all duration-300`}
                style={{
                  width: `${(group.member_count / group.member_limit) * 100}%`,
                }}
              />
            </div>
            {!isFull && spotsRemaining <= 10 && (
              <p className="text-xs text-orange-600 mt-2 text-center">
                Only {spotsRemaining} spot{spotsRemaining !== 1 ? "s" : ""} remaining!
              </p>
            )}
          </div>

          {/* Full Group Warning */}
          {isFull && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
              <p className="text-sm text-red-600 font-medium">
                This group is currently full
              </p>
            </div>
          )}

          {/* Auto-enrollment Info */}
          {!isFull && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                ✨ <strong>Bonus:</strong> You'll be automatically enrolled in all active group
                challenges when you join!
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button
            onClick={handleJoinGroup}
            disabled={joining || isFull}
            className="w-full"
            size="lg"
          >
            {joining ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : isFull ? (
              "Group Full"
            ) : (
              "Join Group"
            )}
          </Button>
          <Button
            onClick={() => navigate("/community")}
            variant="ghost"
            className="w-full"
          >
            Browse Other Groups
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default JoinGroup;
