import React from 'react';
import { getCurrentUser, isCurrentUserAdmin, hasAdminAccess } from '../../services/authService';
import { Card, Typography, Tag } from 'antd';

const { Title, Text } = Typography;

const UserRoleDebug: React.FC = () => {
  const currentUser = getCurrentUser();
  const isAdmin = isCurrentUserAdmin();
  const hasAdmin = hasAdminAccess();

  return (
    <Card title="User Role Debug Info" style={{ maxWidth: 600, margin: '20px auto' }}>
      <div style={{ marginBottom: 16 }}>
        <Title level={4}>Current User Info:</Title>
        {currentUser ? (
          <div>
            <Text strong>Name: </Text>
            <Text>{currentUser.nombres} {currentUser.apellidos}</Text>
            <br />
            <Text strong>Role: </Text>
            <Text>{currentUser.rol}</Text>
            <br />
            <Text strong>Is Admin: </Text>
            <Tag color={currentUser.esAdmin ? 'green' : 'red'}>
              {currentUser.esAdmin ? 'Yes' : 'No'}
            </Tag>
          </div>
        ) : (
          <Text type="danger">No user logged in</Text>
        )}
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <Title level={4}>Authorization Status:</Title>
        <Text strong>isCurrentUserAdmin(): </Text>
        <Tag color={isAdmin ? 'green' : 'red'}>{isAdmin ? 'True' : 'False'}</Tag>
        <br />
        <Text strong>hasAdminAccess(): </Text>
        <Tag color={hasAdmin ? 'green' : 'red'}>{hasAdmin ? 'True' : 'False'}</Tag>
      </div>
    </Card>
  );
};

export default UserRoleDebug;
