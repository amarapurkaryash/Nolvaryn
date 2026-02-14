import React from 'react';
import { AnalysisResult } from '../../../types';
import { NoDataMessage, TabSummary, formatBytes, getFileTypeIcon } from '../shared';

export const AttachmentsTab: React.FC<{ result: AnalysisResult }> = ({ result }) => (
  <div className="animate-fade-in">
    <TabSummary>
      This section lists all attachments found within the email. The analysis is based on metadata like filename and type to assess potential risk without opening the file content.
    </TabSummary>
    {(result.attachments && result.attachments.length > 0) ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {result.attachments.map((att, index) => (
          <div key={index} className="bg-primary-bg p-4 border border-border-dark rounded-lg flex items-start">
            <div className="mr-4 mt-1">{getFileTypeIcon(att.filename, att.filetype)}</div>
            <div className="flex-grow">
              <h4 className="font-bold text-text-body break-all">{att.filename}</h4>
              <p className="text-sm text-text-muted-2">{att.filetype} - {formatBytes(att.sizeInBytes)}</p>
              <div className="mt-3 p-3 bg-secondary-bg border-l-4 border-amber-500 rounded-r-md">
                <p className="text-base text-amber-300/90 leading-relaxed">{att.warning}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <NoDataMessage title="No Attachments Found" message="The analysis did not find any attachments in this email." />
    )}
  </div>
);
