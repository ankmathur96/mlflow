import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './ShowArtifactImageView.css';
import { getSrc } from './ShowArtifactPage';
import { Document, Page, pdfjs } from 'react-pdf';
import { Pagination, Spin } from 'antd';
import {getArtifactBytesContent} from "./ShowArtifactUtils";
import './ShowArtifactPdfView.css';
class ShowArtifactPdfView extends Component {
    constructor(props) {
        super(props);
        this.onPageChange = this.onPageChange.bind(this);
        this.onDocumentLoadSuccess = this.onDocumentLoadSuccess.bind(this);
    }

    state = {
        loading: true,
        error: undefined,
        pdfData: undefined,
        currentPage: 1,
        numPages: 1,
    }

    static propTypes = {
        runUuid: PropTypes.string.isRequired,
        path: PropTypes.string.isRequired,
        getArtifactContent: PropTypes.func,
    };

    static defaultProps = {
        getArtifact: getArtifactBytesContent,
    };

    /** Fetches artifacts and updates component state with the result */
    fetchPdf() {
        const artifactLocation = getSrc(this.props.path, this.props.runUuid);
        this.props
            .getArtifact(artifactLocation)
            .then((artifactPdfData) => {
                this.setState({ pdfData: {data: artifactPdfData}, loading: false });
            })
            .catch((error) => {
                this.setState({ error: error, loading: false });
            });
    }

    componentDidMount = () => {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
        this.fetchPdf();
    };

    componentDidUpdate(prevProps) {
        if (this.props.path !== prevProps.path || this.props.runUuid !== prevProps.runUuid) {
            this.fetchPdf();
        }
    }

    onDocumentLoadSuccess = ({ numPages } ) => {
        this.setState({ numPages });
    }

    onPageChange = (newPageNumber, itemsPerPage) => {
        this.setState({currentPage: newPageNumber});
    }

    renderPdf = () => {
        return (
            <React.Fragment>
                <div className="pdf-viewer">
                    <div className="paginator">
                        <Pagination simple
                                    current={this.state.currentPage}
                                    total={this.state.numPages}
                                    pageSize={1}
                                    onChange={this.onPageChange}/>
                    </div>
                    <div className="document">
                        <Document
                            file={this.state.pdfData}
                            onLoadSuccess={this.onDocumentLoadSuccess}
                            loading={<Spin/>}>
                            <Page pageNumber={this.state.currentPage} loading={<Spin/>}/>
                        </Document>
                    </div>
                </div>
            </React.Fragment>
        );
    };

    render() {
        if (this.state.loading) {
            return <div className='artifact-text-view-loading'>Loading...</div>;
        }
        if (this.state.error) {
            return (
                <div className='artifact-text-view-error'>
                    Oops we couldn't load your file because of an error.
                </div>
            );
        } else {
            return (
                <div className='pdf-outer-container'>
                    {this.renderPdf()}
                </div>
            );
        }
    }
}

export default ShowArtifactPdfView;
