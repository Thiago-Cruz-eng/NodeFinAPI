const express = require('express');
const {v4: uuidv4} =  require('uuid')

const app = express();

app.use(express.json())

const customers = [];

//middleware for verify cpf to not read myself many times in the functions
function verifyExistsAccountCPF(req, res, next) {
//take a cpf from my url, like params and with this using by destructuring
  const {cpf} = req.headers;
//find != some - some is true or false, finda return all data if find
  const customer = customers.find(customer => customer.cpf === cpf);

  if(!customer){
    return res.status(400).json({error: 'Customer not found!'});
  }

  req.customer = customer;
  return next();
};

function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if(operation.type === 'credit') {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0);

  return balance
};

app.post('/account', (req, res) => {
  const {cpf, name} = req.body;

  const customerExists = customers.some(
    (customer) => customer.cpf === cpf
  );

  if(customerExists) {
    return res.status(400).json({error: "Customer had been created!"})
  }

  customers.push({
    cpf,
    name,
    id: uuidv4(),
    statement: []
  });
  return res.status(201).send();
});

app.get("/statement", verifyExistsAccountCPF, (req, res) => {
//take-destructuring customer of my req in middleware
  const {customer} = req;
//here is like, I wil take my client, all of data, but I only will response with statement
  return res.json(customer.statement);
});

app.post('/deposit', verifyExistsAccountCPF, (req, res) => {
  //here, this information is not available in my account, then I need to declare it
  //but not in my original array or in my post method in push, I only can declare a object and push this to my array
  const { description, amount } = req.body;
  //take my customer from my midde (alredy verify if its validy)
  const { customer } = req;
  //show to my method what to do with this
  const statementOperation = { 
    description,
    amount,
    created_at: new Date(),
    type: 'credit'
  };
  //input into my array in another array alredy created and waiting to be fill
  customer.statement.push(statementOperation);

  return res.status(201).send();
});

app.post("/withdraw", verifyExistsAccountCPF, (req, res) => {
  const {amount} = req.body;
  const {customer} = req;

  const balance = getBalance(customer.statement);

  if(balance < amount) {
    return res.status(400).json({error: "insuficient funds!"})
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: 'debit'
  }

  customer.statement.push(statementOperation);

  return res.status(201).send();
});

app.get("/statement/date", verifyExistsAccountCPF, (req, res) => {
  //take-destructuring customer of my req in middleware
    const {customer} = req;
    const {date} = req.query;

    const dateFormat = new Date(date + " 00:00")

    const statement = customer.statement.filter(
      (statement) => 
      statement.created_at.toDateString() ===
      new Date(dateFormat).toDateString()
    );

  //here is like, I wil take my client, all of data, but I only will response with statement
    return res.json(statement);
});

app.put("/account", verifyExistsAccountCPF, (req, res) => {
  const {name} = req.body;
  const {customer} = req;

  customer.name = name;

  return res.status(201).send();
});

app.get("/account", verifyExistsAccountCPF, (req, res) => {
  const {customer} = req;

  return res.json(customer);
});

app.delete("/account", verifyExistsAccountCPF, (req, res) => {
  const {customer} = req;
  customers.splice(customer, 1);
  return res.status(200).json(customers);
});

app.get("/balance", verifyExistsAccountCPF, (req, res) => {
  const {customer} = req;

  const balance = getBalance(customer.statement);

  return res.json(balance);
});

app.listen(3333);