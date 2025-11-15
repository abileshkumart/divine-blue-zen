import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Users,
  Trophy,
  Plus,
  ChevronLeft,
  User,
  Calendar as CalendarIcon,
  Sparkles,
  Activity as ActivityIcon,
  UserPlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';
import PullToRefresh from '@/components/PullToRefresh';
import { CreateChallengeForm } from '@/components/CreateChallengeForm';
import { ChallengeCard } from '@/components/ChallengeCard';
import { CreateGroupForm } from '@/components/CreateGroupForm';
import { GroupCard } from '@/components/GroupCard';

const Community = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState('groups');
  const [showCreateChallengeDialog, setShowCreateChallengeDialog] = useState(false);
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [userGroupIds, setUserGroupIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadCommunityData();
    }
  }, [user]);

  const loadCommunityData = async () => {
    setIsLoadingData(true);
    try {
      await Promise.all([loadGroups(), loadChallenges()]);
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadGroups = async () => {
    try {
      // Load all groups (public) or groups user is member of
      const { data: allGroups, error: groupsError } = await supabase
        .from('practice_groups' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (groupsError) throw groupsError;

      // Load user's group memberships
      const { data: memberships, error: membershipError } = await supabase
        .from('group_members' as any)
        .select('group_id')
        .eq('user_id', user?.id);

      if (membershipError) throw membershipError;

      const memberGroupIds = new Set(memberships?.map((m: any) => m.group_id) || []);
      setUserGroupIds(memberGroupIds);
      setGroups(allGroups || []);
    } catch (error) {
      console.error('Error loading groups:', error);
      toast.error('Failed to load groups');
    }
  };

  const loadChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('challenges' as any)
        .select(`
          *,
          practice_groups(name),
          challenge_participants(user_id, completed_days, is_completed)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setChallenges(data || []);
    } catch (error) {
      console.error('Error loading challenges:', error);
      toast.error('Failed to load challenges');
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      const { error } = await supabase
        .from('challenge_participants' as any)
        .insert({
          challenge_id: challengeId,
          user_id: user?.id,
        });

      if (error) throw error;

      toast.success('Successfully joined challenge! 🎉');
      await loadChallenges();
    } catch (error: any) {
      console.error('Error joining challenge:', error);
      if (error.code === '23505') {
        toast.error('You are already in this challenge');
      } else {
        toast.error('Failed to join challenge');
      }
    }
  };

  const handleChallengeCreated = async (challengeId: string) => {
    setShowCreateChallengeDialog(false);
    await loadChallenges();
    setActiveTab('challenges');
  };

  const handleGroupCreated = async (groupId: string, inviteCode: string) => {
    setShowCreateGroupDialog(false);
    await loadGroups();
    setActiveTab('groups');
    
    // Show invite code toast
    toast.success(
      <div className="space-y-2">
        <p className="font-semibold">Group created successfully! 🎉</p>
        <p className="text-sm">Invite code: <code className="font-mono font-bold">{inviteCode}</code></p>
        <p className="text-xs text-muted-foreground">Share this code with friends to invite them!</p>
      </div>,
      { duration: 8000 }
    );
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      const { error } = await supabase
        .from('group_members' as any)
        .insert({
          group_id: groupId,
          user_id: user?.id,
          role: 'member',
        });

      if (error) throw error;

      toast.success('Successfully joined group! 🎉');
      await loadGroups();
    } catch (error: any) {
      console.error('Error joining group:', error);
      if (error.code === '23505') {
        toast.error('You are already a member of this group');
      } else {
        toast.error('Failed to join group');
      }
    }
  };

  const handleShareGroup = (inviteCode: string) => {
    const inviteUrl = `${window.location.origin}/join-group/${inviteCode}`;
    navigator.clipboard.writeText(inviteUrl);
    toast.success('Invite link copied to clipboard! 📋');
  };

  if (loading || isLoadingData) {
    return (
      <LoadingSpinner
        message="Loading community..."
        subMessage="Connecting with your practice circle"
      />
    );
  }

  return (
    <PullToRefresh onRefresh={loadCommunityData}>
      <div className="min-h-screen bg-background pb-safe">
        {/* Header */}
        <header className="relative border-b border-border/50 backdrop-blur-sm bg-gradient-to-r from-card/80 via-accent/5 to-indigo/5 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/home')}
                className="rounded-full hover:bg-accent/20"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <h1 className="text-2xl font-bold text-glow">Community</h1>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-accent/20"
              >
                <UserPlus className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="groups" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Groups
              </TabsTrigger>
              <TabsTrigger value="challenges" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Challenges
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <ActivityIcon className="w-4 h-4" />
                Feed
              </TabsTrigger>
            </TabsList>

            {/* Groups Tab */}
            <TabsContent value="groups" className="space-y-4">
              {/* Create Group Button */}
              <div className="flex justify-end">
                <Button
                  onClick={() => setShowCreateGroupDialog(true)}
                  className="bg-gradient-to-r from-accent to-indigo hover:from-accent/90 hover:to-indigo/90 shadow-glow"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Group
                </Button>
              </div>

              {/* Groups List */}
              {groups.length === 0 ? (
                <Card className="p-12 text-center bg-gradient-to-br from-card/80 to-secondary/30 backdrop-blur-sm border-accent/20">
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent/20 to-indigo/20 flex items-center justify-center mx-auto">
                      <Users className="w-10 h-10 text-accent" />
                    </div>
                    <h3 className="text-xl font-semibold">Start Your Practice Circle</h3>
                    <p className="text-muted-foreground">
                      Create or join groups to practice meditation, yoga, and mindfulness together with like-minded souls.
                    </p>
                    <Button
                      onClick={() => setShowCreateGroupDialog(true)}
                      className="bg-gradient-to-r from-accent to-indigo hover:from-accent/90 hover:to-indigo/90 shadow-glow"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create Your First Group
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {groups.map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      currentUserId={user?.id}
                      isMember={userGroupIds.has(group.id)}
                      onJoin={handleJoinGroup}
                      onShare={handleShareGroup}
                      onView={(groupId) => {
                        // Switch to challenges tab and filter by group
                        setActiveTab('challenges');
                        toast.info('Showing group challenges');
                      }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Challenges Tab */}
            <TabsContent value="challenges" className="space-y-4">
              {/* Create Challenge Button */}
              <div className="flex justify-end">
                <Button
                  onClick={() => setShowCreateChallengeDialog(true)}
                  className="bg-gradient-to-r from-accent to-indigo hover:from-accent/90 hover:to-indigo/90 shadow-glow"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Challenge
                </Button>
              </div>

              {/* Challenges List */}
              {challenges.length === 0 ? (
                <Card className="p-12 text-center bg-gradient-to-br from-card/80 to-secondary/30 backdrop-blur-sm border-accent/20">
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent/20 to-indigo/20 flex items-center justify-center mx-auto">
                      <Trophy className="w-10 h-10 text-accent" />
                    </div>
                    <h3 className="text-xl font-semibold">Take on a Challenge</h3>
                    <p className="text-muted-foreground">
                      Join 21-day meditation journeys, 30-day yoga practices, and other transformative challenges with your community.
                    </p>
                    <Button
                      onClick={() => setShowCreateChallengeDialog(true)}
                      className="bg-gradient-to-r from-accent to-indigo hover:from-accent/90 hover:to-indigo/90 shadow-glow"
                    >
                      <Trophy className="w-5 h-5 mr-2" />
                      Create Your First Challenge
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {challenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      currentUserId={user?.id}
                      onJoin={handleJoinChallenge}
                      onView={(id) => {
                        toast.info('Challenge details coming soon!');
                      }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Activity Feed Tab */}
            <TabsContent value="activity" className="space-y-4">
              {/* Empty State */}
              <Card className="p-12 text-center bg-gradient-to-br from-card/80 to-secondary/30 backdrop-blur-sm border-accent/20">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent/20 to-indigo/20 flex items-center justify-center mx-auto">
                    <ActivityIcon className="w-10 h-10 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold">Stay Connected</h3>
                  <p className="text-muted-foreground">
                    See what your practice community is up to. Celebrate achievements, share insights, and support each other's journey.
                  </p>
                  <Button
                    className="bg-gradient-to-r from-accent to-indigo hover:from-accent/90 hover:to-indigo/90 shadow-glow"
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Invite Friends
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border/50 p-4 z-50 safe-bottom-nav">
          <div className="flex items-center justify-around max-w-md mx-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/home')}
              className="flex flex-col gap-1 h-auto py-2"
            >
              <Sparkles className="w-6 h-6" />
              <span className="text-xs">Home</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/calendar')}
              className="flex flex-col gap-1 h-auto py-2"
            >
              <CalendarIcon className="w-6 h-6" />
              <span className="text-xs">Calendar</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="flex flex-col gap-1 h-auto py-2 text-accent"
            >
              <Users className="w-6 h-6" />
              <span className="text-xs">Community</span>
            </Button>
          </div>
        </nav>

        {/* Create Challenge Dialog */}
        <Dialog open={showCreateChallengeDialog} onOpenChange={setShowCreateChallengeDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-glow flex items-center gap-2">
                <Trophy className="w-6 h-6 text-accent" />
                Create New Challenge
              </DialogTitle>
            </DialogHeader>
            <CreateChallengeForm
              onSuccess={handleChallengeCreated}
              onCancel={() => setShowCreateChallengeDialog(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Create Group Dialog */}
        <Dialog open={showCreateGroupDialog} onOpenChange={setShowCreateGroupDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-glow flex items-center gap-2">
                <Users className="w-6 h-6 text-accent" />
                Create Practice Group
              </DialogTitle>
            </DialogHeader>
            <CreateGroupForm
              onSuccess={handleGroupCreated}
              onCancel={() => setShowCreateGroupDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </PullToRefresh>
  );
};

export default Community;
