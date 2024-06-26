import { AccountCircle } from '@mui/icons-material'
import { Avatar, Card, CardContent, Typography } from '@mui/material'
import { FC, memo } from 'react'

import { User } from '@/lib/user'

interface Props {
  user: User
}

const UserCard: FC<Props> = ({ user }) => {
  return (
    <Card>
      <CardContent
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <Avatar>
          <AccountCircle />
        </Avatar>
        <Typography color="textSecondary">Username: {user.username}</Typography>
        <Typography color="textSecondary">Email: {user.email}</Typography>
      </CardContent>
    </Card>
  )
}

export default memo(UserCard)
