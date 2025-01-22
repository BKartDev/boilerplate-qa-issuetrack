'use strict';

const IssueHandler = require('../controllers/issueHandler.js');

module.exports = function (app) {
  let issueHandler = new IssueHandler();

  app.route('/api/issues/:testProject')
  
    .get(function (req, res){
      let project = req.params.project;

      let issues = issueHandler.getProject(project);

      issues = ((issues.length === 0)
        ? issues
        : issueHandler.getFilteredIssues(issues, req.query))

      res.json(issues)
    })
    
    .post(function (req, res){
      let project = req.params.project;
      let  { issue_title, issue_text, created_by} = req.body

      if (!issue_title || !issue_text || !created_by) {
        return res.json({error: 'required field(s) missing'});
      }
      let optional = {
        assigned_to: req.body.assigned_to || "",
        status_text: req.body.status_text || "",
      };
      let defaults = {
        _id: Array.from({length: 10}).reduce((acc)=>acc+Math.round(Math.random()*10),""),
        open: true,
        created_on: new Date().toISOString(),
        updated_on: new Date().toISOString()
      };
      let issue = {
        issue_title,
        issue_text,
        created_by,
        ...optional,
        ...defaults
      }
      issue = issueHandler.createIssue(project, issue);
      res.json({...issue})
    })
    
    .put(function (req, res){
      let project = req.params.project;
      let {_id} = req.body
      let attrs = {};

      if(!_id){
        return res.json({error: 'missing _id'});
      }
      for (const [key, val] of Object.entries(req.body)){
        if (val !== "") {
          attrs[key] = val
        }
      }
      if(Object.keys(attrs).length <= 1){
        return res.json({error:'no update field(s) sent',
          _id: _id
        })
      }
      return res.json(issueHandler.updateIssue(project, attrs))
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      let {_id} = req.body

      if(!_id){
        return res.json({error: 'missing _id'});
      }

      let result = issueHandler.deleteIssue(project, _id);
      res.json(result)
    })
    
};