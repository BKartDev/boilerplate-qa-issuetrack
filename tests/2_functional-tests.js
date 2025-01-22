const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  let  issueIds = [];  // Valid IDs returned from successful POST requests

  // Test #1
  test('POST Create an issue with all fields', function(done) {
    chai
      .request(server)
      .post('/api/issues/testProject')
      .send({
        issue_title: "New feature needed",
        issue_text: "Add a functionality to enhance user experience.",
        created_by: "john-doe",
        assigned_to: "jane",
        status_text: "high priority"
      })
      .end(function(err, res) {
        issueIds.push(res.body._id);
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, "New feature needed");
        assert.equal(res.body.issue_text, "Add a functionality to enhance user experience.");
        assert.equal(res.body.created_by, "john-doe");
        assert.equal(res.body.assigned_to, "jane");
        assert.equal(res.body.status_text, "high priority");
        assert.equal(res.body.open, true);
        assert.isNotEmpty(res.body.created_on);
        assert.isNotEmpty(res.body.updated_on);

        done();
      });
  });

  // Test #2
  test('POST Create an issue with only required fields', function(done) {
    chai
      .request(server)
      .post('/api/issues/testProject')
      .send({
        issue_title: "Critical bug",
        issue_text: "System crashes intermittently.",
        created_by: "john-doe",
      })
      .end(function(err, res) {
        issueIds.push(res.body._id);
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, "Critical bug");
        assert.equal(res.body.issue_text, "System crashes intermittently.");
        assert.equal(res.body.created_by, "john-doe");
        assert.equal(res.body.assigned_to, "");
        assert.equal(res.body.status_text, "");
        assert.equal(res.body.open, true);
        assert.isNotEmpty(res.body.created_on);
        assert.isNotEmpty(res.body.updated_on);

        done();
      });
  });

  // Test #3
  test('POST Create an issue with missing required fields', function(done) {
    chai
      .request(server)
      .post('/api/issues/testProject')
      .send({
        issue_title: "Incomplete submission",
        issue_text: "No creator provided."
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'required field(s) missing');

        done();
      });
  });

  // Test #4
  test('GET View issues for a project', function(done) {
    chai
      .request(server)
      .get('/api/issues/testProject')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isAtLeast(res.body.length, 1);

        done();
      });
  });

  // Test #5
  test('GET View issues with a single filter', function(done) {
    chai
      .request(server)
      .get('/api/issues/testProject?assigned_to=')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.length, 1);
        assert.isTrue(res.body[0].open);
        assert.equal(res.body[0].issue_title, "Critical bug");

        done();
      });
  });

  // Test #6
  test('GET View issues with multiple filters', function(done) {
    chai
      .request(server)
      .get('/api/issues/testProject?open=true&assigned_to=jane')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.length, 1);
        assert.isTrue(res.body[0].open);
        assert.equal(res.body[0].issue_title, "New feature needed");

        done();
      });
  });

  // Test #7
  test('PUT Update a single field of an issue', function(done) {
    chai
      .request(server)
      .put('/api/issues/testProject')
      .send({
        _id: issueIds[0],
        issue_title: "Updated feature request"
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, issueIds[0]);

        done();
      });
  });

  // Test #8
  test('PUT Update multiple fields of an issue', function(done) {
    chai
      .request(server)
      .put('/api/issues/testProject')
      .send({
        _id: issueIds[0],
        issue_title: "Feature update completed",
        open: false
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, issueIds[0]);

        done();
      });
  });

  // Test #9
  test('PUT Update an issue without _id', function(done) {
    chai
      .request(server)
      .put('/api/issues/testProject')
      .send({
        issue_title: "Incomplete update request"
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'missing _id');

        done();
      });
  });

  // Test #10
  test('PUT Update an issue without fields to update', function(done) {
    chai
      .request(server)
      .put('/api/issues/testProject')
      .send({
        _id: issueIds[0]
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'no update field(s) sent');
        assert.equal(res.body._id, issueIds[0]);

        done();
      });
  });

  // Test #11
  test('PUT Update an issue with an invalid _id', function(done) {
    chai
      .request(server)
      .put('/api/issues/testProject')
      .send({
        _id: 'invalid123',
        issue_title: 'Nonexistent issue'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'could not update');
        assert.equal(res.body._id, 'invalid123');

        done();
      });
  });

  // Test #12
  test('DELETE an issue with a valid _id', function(done) {
    chai
      .request(server)
      .delete('/api/issues/testProject')
      .send({
        _id: issueIds[1]
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully deleted');
        assert.equal(res.body._id, issueIds[1]);

        done();
      });
  });

  // Test #13
  test('DELETE an issue with an invalid _id', function(done) {
    chai
      .request(server)
      .delete('/api/issues/testProject')
      .send({
        _id: 'nonexistent123'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'could not delete');
        assert.equal(res.body._id, 'nonexistent123');

        done();
      });
  });

  // Test #14
  test('DELETE an issue without providing an _id', function(done) {
    chai
      .request(server)
      .delete('/api/issues/testProject')
      .send({})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'missing _id');

        done();
      });
  });
});
