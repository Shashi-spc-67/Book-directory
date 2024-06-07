const http = require('http');
const fs = require('fs');
const path = require('path');

const getbooks = () => {
  const data = fs.readFileSync(path.join(__dirname, 'books.json'));
  return JSON.parse(data);
};
const savebooks = (books) => {
  fs.writeFileSync(path.join(__dirname, 'books.json'), JSON.stringify(books));
};

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/books') {           // ? adding a data
    const books = getbooks();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(books));
    
  } else if (req.method === 'POST' && req.url === '/books') {   // ? post a data
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const { title, author } = JSON.parse(body);
      if (!title || !author) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Title and Author are required' }));
        return;
      }
      const books = getbooks();
      const newBook = { id: Date.now(), title, author };
      books.push(newBook);
      savebooks(books);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newBook));
    });
  } else if (req.method === 'PUT' && req.url.startsWith('/books/')) {   //? update a data

    const id = parseInt(req.url.split('/')[2]);
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const { title, author } = JSON.parse(body);
      if (!title || !author) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Title and Author are required' }));
        return;
      }
      const books = getbooks();
      const bookIndex = books.findIndex(b => b.id === id);
      if (bookIndex === -1) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Book not found' }));
        return;
      }
      books[bookIndex] = { id, title, author };
      savebooks(books);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(books[bookIndex]));
    });
  } else if (req.method === 'DELETE' && req.url.startsWith('/books/')) { // ? delete data
   
    const id = parseInt(req.url.split('/')[2]);
    const books = getbooks();
    const newBooks = books.filter(b => b.id !== id);
    if (books.length === newBooks.length) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Book not found' }));
      return;
    }
    savebooks(newBooks);
    res.writeHead(204);
    res.end();
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(3000, () => {
  console.log('Server is listening on port :http://localhost:3000');
});



