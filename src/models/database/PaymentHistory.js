const { DataTypes } = require('sequelize');

module.exports = sequelize => {
  sequelize.define('PaymentHistory', {
    // Model attributes are defined here
    orderId: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    customerId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    transactionAmount: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    paymentMode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    transactionDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false
    },
    responseMessage: {
      type: DataTypes.STRING,
      allowNull: false
    },
    gatewayName: DataTypes.STRING,
    bankTransactionId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    bankName: DataTypes.STRING,
  }, {
    tableName: 'payment_history'
  });
};