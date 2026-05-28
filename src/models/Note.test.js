const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Mock the database configuration before importing the model
jest.mock('../config/database', () => ({
  sequelize: {
    define: jest.fn(),
  },
}));

const Note = require('./Note');

describe('Note Model', () => {
  it('should call sequelize.define with the model name "Note"', () => {
    expect(sequelize.define).toHaveBeenCalledWith(
      'Note',
      expect.any(Object),
      expect.any(Object)
    );
  });

  it('should define id as UUID primary key with default UUIDV4', () => {
    const [[, attributes]] = sequelize.define.mock.calls;
    expect(attributes.id).toEqual({
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    });
  });

  it('should define title as STRING(255) not null with notEmpty validation', () => {
    const [[, attributes]] = sequelize.define.mock.calls;
    expect(attributes.title).toMatchObject({
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    });
  });

  it('should define content as TEXT not null with notEmpty validation', () => {
    const [[, attributes]] = sequelize.define.mock.calls;
    expect(attributes.content).toMatchObject({
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    });
  });

  it('should define archived as BOOLEAN with default false', () => {
    const [[, attributes]] = sequelize.define.mock.calls;
    expect(attributes.archived).toEqual({
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    });
  });

  it('should set tableName to "notes" and add an index on archived', () => {
    const [[, , options]] = sequelize.define.mock.calls;
    expect(options.tableName).toBe('notes');
    expect(options.indexes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fields: ['archived'],
        }),
      ])
    );
  });
});