const { DataTypes } = require('sequelize');

module.exports = sequelize => {
  sequelize.define('PaymentHistory', {
    // Model attributes are defined here
    transactionId: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    orderId: DataTypes.STRING,
    customerId: DataTypes.STRING,
    transactionAmount: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    paymentMode: DataTypes.STRING,
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
    bankTransactionId: DataTypes.STRING,
    bankName: DataTypes.STRING,
  }, {
    tableName: 'payment_history'
  });
};