const chai = require('chai');
const assert = chai.assert;

const server = require('../server');

const chaiHttp = require('chai-http');
chai.use(chaiHttp);

suite('Functional Tests', function () {
  this.timeout(5000);
  suite('Integration tests with chai-http', function () {
    // #1
    test('Test GET /hello with no name', function (done) {
      chai
        .request(server)
        .keepOpen()
        .get('/hello')
        .end(function (err, res) {
          assert.equal(res.status, 200, 'Response status should be 200');
          assert.equal(res.text, 'hello Guest', 'Response should be "hello Guest"');
          done();
        });
    });
    // #2
    test('Test GET /hello with your name', function (done) {
      chai
        .request(server)
        .keepOpen()
        .get('/hello?name=xy_z') // Replace "xy_z" with your actual name if needed
        .end(function (err, res) {
          assert.equal(res.status, 200); // Check if status is 200 (OK)
          assert.equal(res.text, 'hello xy_z'); // Check if the response text is 'hello <your_name>'
          done();
        });
    });
    // #3
    test('Send {surname: "Colombo"}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .put('/travellers')
        .send({
          "surname": "Colombo"
        })
        .end(function (err, res) {
          if (err) done(err); // Ensure any errors are passed to the done callback

          // Assert the status is 200
          assert.equal(res.status, 200);

          // Assert the response type is application/json
          assert.equal(res.type, 'application/json');

          // Assert the body contains the correct values
          assert.equal(res.body.name, 'Cristoforo');
          assert.equal(res.body.surname, 'Colombo');

          done();
        });
    });
    // #4
    test('Send {surname: "da Verrazzano"}', function (done) {
      const requestBody = {
        surname: "da Verrazzano"
      };

      // Send a PUT request to the /travellers endpoint
      chai.request(server)
        .put('/travellers')
        .send(requestBody) // Send the JSON object with the surname
        .end(function (err, res) {
          // Check the assertions
          assert.equal(res.status, 200); // Status code should be 200
          assert.equal(res.type, 'application/json'); // Response type should be application/json
          assert.equal(res.body.name, 'Giovanni'); // Body should contain the name "Giovanni"
          assert.equal(res.body.surname, 'da Verrazzano'); // Body should contain the surname "da Verrazzano"

          done(); // Indicate that the test is complete
        });
    });
  });
});

const Browser = require('zombie');
Browser.site = 'http://localhost:3000';

suite('Functional Tests with Zombie.js', function () {
  this.timeout(5000);

  const browser = new Browser();

  suite('Headless browser', function () {
    test('should have a working "site" property', function () {
      assert.isNotNull(browser.site);
    });
  });

  suite('"Famous Italian Explorers" form', function () {

    // #5
    test('Submit the surname "Colombo" in the HTML form', function (done) {
      browser.visit('http://localhost:3000', function () {
        // Fill in the form with the surname Colombo
        browser.fill('surname', 'Colombo');

        // Press the submit button
        browser.pressButton('submit', function () {
          // Assert that status is OK 200
          assert.equal(browser.status, 200);

          // Assert that the text inside the element span#name is 'Cristoforo'
          assert.equal(browser.text('span#name'), 'Cristoforo');

          // Assert that the text inside the element span#surname is 'Colombo'
          assert.equal(browser.text('span#surname'), 'Colombo');

          // Assert that the element(s) span#dates exist and their count is 1
          assert.equal(browser.queryAll('span#dates').length, 1);

          done();
        });
      });
    });

    // #6
    test('Submit "surname" : "Vespucci" in the HTML form', function (done) {
      browser.fill('surname', 'Vespucci');
      browser.pressButton('submit', function () {
        browser.assert.success();
        browser.assert.text('span#name', 'Amerigo');
        browser.assert.text('span#surname', 'Vespucci');
        browser.assert.element('span#dates','1');
        done();
      });
    });
  });
});