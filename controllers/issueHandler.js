function IssueHandler() {
    this.db = [];

    this.getProject = (title) => this.db[title] || [];

    this.createIssue = (title, issue) => {
        if (!this.db[title]) {
            this.db[title] = [];
        }
        this.db[title].unshift(issue);
        return this.db[title][0];
    };

    this.getFilteredIssues = (issues, filters = {}) => {
        return issues.filter(issue => 
            Object.entries(filters).every(([key, val]) => `${issue[key]}` === `${val}`)
        );
    };

    this.updateIssue = (title, attrs) => {
        const issues = this.db[title] || [];
        let updated = false;

        const updatedIssues = issues.map(issue => {
            if (issue._id === attrs._id) {
                updated = true;
                return { ...issue, ...attrs, updated_on: new Date().toISOString() };
            }
            return issue;
        });

        if (updated) {
            this.db[title] = updatedIssues;
            return { result: 'successfully updated', _id: attrs._id };
        }

        return { error: 'could not update', _id: attrs._id };
    };

    this.deleteIssue = (title, id) => {
        const issues = this.getProject(title);
        const filteredIssues = issues.filter(issue => issue._id !== id);

        if (filteredIssues.length !== issues.length) {
            this.db[title] = filteredIssues;
            return { _id: id, result: 'successfully deleted' };
        }

        return { _id: id, error: 'could not delete' };
    };
}

module.exports = IssueHandler;
