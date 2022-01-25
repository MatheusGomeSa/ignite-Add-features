import React, { Component } from 'react';

export class Comments extends Component {

    componentDidMount() {
        let scriptEl = document.createElement('script');
        let anchor = document.getElementById("inject-comments-for-uterances");
        scriptEl.setAttribute('src', 'https://utteranc.es/client.js')
        scriptEl.setAttribute('crossoring', 'anonymous')
        scriptEl.setAttribute("async", "")
        scriptEl.setAttribute("repo", "MatheusGomeSa/ignite-Add-features")
        scriptEl.setAttribute("issue-term", "url")
        scriptEl.setAttribute("theme", "dark-blue")
        anchor.appendChild(scriptEl);
    }
    render() {
        return (
            <div id="inject-comments-for-uterances"></div>
        );
    }


}