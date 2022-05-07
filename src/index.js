const express = require('express');
const {v4: uuidv4} =  require('uuid')

const app = express();

app.use(express.json())

const customers = [];

//middleware for verify cpf to not read myself many times in the functions
function verifyExistsAcoountCPF(req, res, next) {
//take a cpf from my url, like params and with this using by destructuring
  const {cpf} = req.headers;
//find != some - some is true or false, finda return all data if find
  const customer = customers.find(customer => customer.cpf === cpf);

  if(!customer){
    return res.status(400).json({error: 'Customer not found!'});
  }

  req.customer = customer;
  return next();
}

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

app.get("/statement", verifyExistsAcoountCPF, (req, res) => {
//take-destructuring customer of my req in middleware
  const {customer} = req;
//here is like, I wil take my client, all of data, but I only will response with statement
  return res.json(customer.statement);
});

app.listen(3333);