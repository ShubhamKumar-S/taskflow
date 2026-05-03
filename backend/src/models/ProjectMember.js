const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProjectMember = sequelize.define(
  'ProjectMember',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'member'),
      allowNull: false,
      defaultValue: 'member'
    }
  },
  {
    tableName: 'project_members',
    underscored: true,
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['project_id', 'user_id']
      }
    ]
  }
);

module.exports = ProjectMember;
