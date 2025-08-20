-- Enable RLS on tables
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE task ENABLE ROW LEVEL SECURITY;

-- Groups table policies
-- Allow users to create groups
CREATE POLICY "Users can create groups" ON groups
    FOR INSERT WITH CHECK (true);

-- Allow users to view groups they are members of
CREATE POLICY "Users can view groups they belong to" ON groups
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_members.group_id = groups.id 
            AND group_members.user_id = auth.uid()
        )
    );

-- Allow group admins to update groups
CREATE POLICY "Admins can update groups" ON groups
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_members.group_id = groups.id 
            AND group_members.user_id = auth.uid()
            AND group_members.role IN ('admin', 'owner')
        )
    );

-- Allow group admins to delete groups
CREATE POLICY "Admins can delete groups" ON groups
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_members.group_id = groups.id 
            AND group_members.user_id = auth.uid()
            AND group_members.role IN ('admin', 'owner')
        )
    );

-- Group members table policies
-- Allow users to insert themselves as members (for group creation)
CREATE POLICY "Users can add themselves to groups" ON group_members
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Allow users to view members of groups they belong to
CREATE POLICY "Users can view group members" ON group_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM group_members gm2
            WHERE gm2.group_id = group_members.group_id 
            AND gm2.user_id = auth.uid()
        )
    );

-- Allow users to leave groups (delete their own membership)
CREATE POLICY "Users can leave groups" ON group_members
    FOR DELETE USING (user_id = auth.uid());

-- Allow admins to remove other members
CREATE POLICY "Admins can remove members" ON group_members
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM group_members gm2
            WHERE gm2.group_id = group_members.group_id 
            AND gm2.user_id = auth.uid()
            AND gm2.role IN ('admin', 'owner')
        )
    );

-- Task table policies
-- Allow users to create tasks for groups they belong to
CREATE POLICY "Users can create group tasks" ON task
    FOR INSERT WITH CHECK (
        group_id IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_members.group_id = task.group_id 
            AND group_members.user_id = auth.uid()
        )
    );

-- Allow users to create personal tasks
CREATE POLICY "Users can create personal tasks" ON task
    FOR INSERT WITH CHECK (
        group_id IS NULL AND user_id = auth.uid()
    );

-- Allow users to view tasks from groups they belong to
CREATE POLICY "Users can view group tasks" ON task
    FOR SELECT USING (
        group_id IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_members.group_id = task.group_id 
            AND group_members.user_id = auth.uid()
        )
    );

-- Allow users to view their personal tasks
CREATE POLICY "Users can view personal tasks" ON task
    FOR SELECT USING (
        group_id IS NULL AND user_id = auth.uid()
    );

-- Allow users to update tasks they created
CREATE POLICY "Users can update their tasks" ON task
    FOR UPDATE USING (user_id = auth.uid());

-- Allow users to delete tasks they created
CREATE POLICY "Users can delete their tasks" ON task
    FOR DELETE USING (user_id = auth.uid());

-- Allow admins to delete any task in their groups
CREATE POLICY "Admins can delete group tasks" ON task
    FOR DELETE USING (
        group_id IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_members.group_id = task.group_id 
            AND group_members.user_id = auth.uid()
            AND group_members.role IN ('admin', 'owner')
        )
    );
