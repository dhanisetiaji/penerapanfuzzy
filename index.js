//use library fuzzy string matching
const fuzz = require('fuzzball')
//use path module
const path = require('path');
//use express module
const express = require('express');
//use hbs view engine
const hbs = require('hbs');
//use bodyParser middleware
const bodyParser = require('body-parser');
//use mysql database
const mysql = require('mysql');
const { json } = require('body-parser');
const app = express();

//Create Connection
const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'fuzzy'
});

//connect to database
conn.connect((err) =>{
  if(err) throw err;
  console.log('Mysql Connected...');
});

//set views file
app.set('views',path.join(__dirname,'views'));
//set view engine
app.set('view engine', 'hbs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//set folder public as static folder for static file
app.use('/assets',express.static(__dirname + '/public'));

//route for homepage
app.get('/',(req, res) => {
  let sql = "SELECT * FROM product";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.render('product_view',{
      results: results
    });
  });
});

//route for insert data
app.post('/save',(req, res) => {
  let data = {kode_product: req.body.kode_product, product_name: req.body.product_name};
  let sql = "INSERT INTO product SET ?";
  let query = conn.query(sql, data,(err, results) => {
    if(err) throw err;
    res.redirect('/');
  });
});

//route for update data
app.post('/update',(req, res) => {
  let sql = "UPDATE product SET kode_product='"+req.body.kode_product+"', product_name='"+req.body.product_name+"' WHERE product_id="+req.body.id;
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.redirect('/');
  });
});

//route for delete data
app.post('/delete',(req, res) => {
  let sql = "DELETE FROM product WHERE product_id="+req.body.product_id+"";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
      res.redirect('/');
  });
});

app.post('/search', (req,res) => {
  var data = req.body.search
  // dataProduct = '';
  let sql = "SELECT kode_product,product_name FROM product"
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    // dataku = JSON.stringify(results)
    function myCustomScorer(query, choice, options) {
      return fuzz.ratio(query, choice.kode_product, options);
    }
    options = {scorer: myCustomScorer}
    resfuzzy = fuzz.extract(data, results, options);
    console.log(resfuzzy)
    let ketemu = ""
    for(i=0;i<resfuzzy.length;i++){
        // console.log("mencari data...")
        if(resfuzzy[i][1] == 100){
            ketemu = resfuzzy[i][0].product_name;
            break
        }else{
            ketemu = "data tidak ada"
        }
    }
    // console.log(ketemu)
    res.render('search_view',{
      search: ketemu,
      semuadata: resfuzzy,
      kata: data
    });
    // res.redirect('/');
  });
  // console.log(dataProduct)
  // console.log(data)
})

//server listening
app.listen(8000, () => {
  console.log('Server is running at port 8000');
});
