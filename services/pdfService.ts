import { jsPDF } from 'jspdf';
import { AnalysisResult } from '../types';

// Toast message function for showing analysis time
export const showSuccessToast = (analysisTime: number) => {
  const seconds = Math.round(analysisTime / 1000);
  const timeString = seconds < 60 ? `${seconds}s` : seconds < 3600 ? `${Math.round(seconds / 60)}m ${seconds % 60}s` : `${Math.round(seconds / 3600)}h ${Math.round((seconds % 3600) / 60)}m`;
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
  
  // Create toast content using DOM methods
  const container = document.createElement('div');
  container.className = 'flex items-center justify-between';
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'flex items-center';
  
  const iconSpan = document.createElement('span');
  iconSpan.className = 'material-symbols-outlined mr-2';
  iconSpan.textContent = 'check_circle';
  
  const textDiv = document.createElement('div');
  
  const titleDiv = document.createElement('div');
  titleDiv.className = 'font-bold';
  titleDiv.textContent = 'Analysis Complete!';
  
  const timeDiv = document.createElement('div');
  timeDiv.className = 'text-sm';
  timeDiv.textContent = `Completed in ${timeString}`;
  
  textDiv.appendChild(titleDiv);
  textDiv.appendChild(timeDiv);
  contentDiv.appendChild(iconSpan);
  contentDiv.appendChild(textDiv);
  
  const closeButton = document.createElement('button');
  closeButton.className = 'ml-4 text-white hover:text-gray-200';
  closeButton.addEventListener('click', () => {
    toast.remove();
  });
  
  const closeIcon = document.createElement('span');
  closeIcon.className = 'material-symbols-outlined';
  closeIcon.textContent = 'close';
  
  closeButton.appendChild(closeIcon);
  container.appendChild(contentDiv);
  container.appendChild(closeButton);
  toast.appendChild(container);
  
  document.body.appendChild(toast);
};

export const generatePDFReport = (result: AnalysisResult): jsPDF => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  
  // Standardized spacing constants
  const LINE_HEIGHT = 5.5;
  const SECTION_TITLE_HEIGHT = 25;
  const BOX_PADDING = 10;
  const PAGE_BREAK_THRESHOLD = pageHeight - margin - 15;
  let currentPage = 1;
  let fileName = result.emailInfo?.subject || 'Email Analysis';
  let sectionNum = 2; // Start from 2 since Table of Contents is section 1

  // Colors - very light shades
  const colors = {
    primary: [139, 92, 246],
    text: [31, 41, 55],
    lightRed: [254, 242, 242],
    lightGreen: [240, 253, 244],
    lightBlue: [239, 246, 255],
    lightAmber: [255, 251, 235],
    lightGray: [249, 250, 251],
    lightPurple: [245, 243, 255],
    borderGray: [220, 220, 220],
  };

  // Helper to add watermark (single in center)
  const addWatermark = () => {
    doc.saveGraphicsState();
    (doc as any).setGState(new (doc as any).GState({ opacity: 0.04 }));
    doc.setTextColor(139, 92, 246);
    doc.setFontSize(80);
    doc.setFont('helvetica', 'bold');
    doc.text('NOLVARYN', pageWidth / 2, pageHeight / 2, { align: 'center', angle: 30 });
    doc.restoreGraphicsState();
    doc.setTextColor(0, 0, 0);
  };

  // Helper to add header
  const addHeader = () => {
    const displayName = fileName.length > 45 ? fileName.substring(0, 42) + '...' : fileName;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(displayName, margin, 12);
  };

  // Helper to add footer
  const addFooter = () => {
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Page ${currentPage}`, pageWidth - margin, pageHeight - 12, { align: 'right' });
  };

  // Helper to add new page
  const addNewPage = () => {
    doc.addPage();
    currentPage++;
    addWatermark();
    addHeader();
    addFooter();
  };

  // Helper to check if text really needs wrapping
  const needsWrapping = (text: string, maxWidth: number): boolean => {
    if (!text || text.trim().length === 0) return false;
    
    // Check actual width with current font settings
    const textWidth = doc.getTextWidth(text.trim());
    return textWidth > maxWidth;
  };

  // Helper to format content like web UI - with proper spacing and structure
  const formatContentLikeWebUI = (lines: string[]): string[] => {
    const formattedLines: string[] = [];
    
    lines.forEach((line, index) => {
      if (!line || line.trim().length === 0) {
        // Skip empty lines but add spacing
        if (index > 0 && formattedLines.length > 0 && formattedLines[formattedLines.length - 1] !== '') {
          formattedLines.push('');
        }
        return;
      }
      
      const trimmedLine = line.trim();
      
      // Add spacing between different sections
      if (index > 0 && lines[index - 1] && lines[index - 1].trim() !== '' && 
          (trimmedLine.match(/^(URL|Verdict|Safety|Severity|Source|Impact|Type|Country|ISP|Filename|File|Content|Size|From|To|Subject|Date|Reply|File|By|Protocol|Timestamp|Positive|Negative|IP|Domain|Email|SPF|DKIM|DMARC):/i))) {
        formattedLines.push('');
      }
      
      // Format parameters with proper spacing
      if (trimmedLine.match(/^(URL|Verdict|Safety Score|Severity|Source|Impact|Type|Country|ISP|Filename|File Type|Content ID|Size|From:|To:|Subject:|Date:|Reply-To:|File Hash:|By:|Protocol:|Timestamp:)/i)) {
        formattedLines.push(trimmedLine);
      }
      // Format list items with proper indentation
      else if (trimmedLine.startsWith('•')) {
        formattedLines.push('  ' + trimmedLine);
      }
      else if (trimmedLine.startsWith('+') || trimmedLine.startsWith('-')) {
        formattedLines.push('    ' + trimmedLine);
      }
      // Regular content with minimal formatting
      else {
        // Break very long sentences into readable chunks
        if (trimmedLine.length > 120) {
          const words = trimmedLine.split(' ');
          let currentLine = '';
          words.forEach((word, wordIndex) => {
            if ((currentLine + ' ' + word).length <= 100) {
              currentLine += (currentLine ? ' ' : '') + word;
            } else {
              if (currentLine) formattedLines.push(currentLine);
              currentLine = word;
            }
          });
          if (currentLine) formattedLines.push(currentLine);
        } else {
          formattedLines.push(trimmedLine);
        }
      }
    });
    
    return formattedLines;
  };

  // FLEXIBLE box function - adapts to content size
  const drawBox = (y: number, title: string, contentLines: string[], bgColor: number[], borderColor: number[]): number => {
    const boxPadding = 10;
    const lineHeight = 6;
    const titleHeight = 20;
    
    // Process content with SMART wrapping
    const maxTextWidth = contentWidth - (boxPadding * 2) - 5; // Safety margin
    let processedLines: string[] = [];
    
    contentLines.forEach((line) => {
      if (!line || line.trim().length === 0) return;
      
      const trimmedLine = line.trim();
      
      // Smart wrapping - only if truly needed
      if (doc.getTextWidth(trimmedLine) > maxTextWidth) {
        const wrappedLines = doc.splitTextToSize(trimmedLine, maxTextWidth);
        processedLines = processedLines.concat(wrappedLines.map((wrappedLine: string) => wrappedLine.trim()));
      } else {
        processedLines.push(trimmedLine);
      }
    });
    
    // FLEXIBLE height calculation - ensure no overflow
    const contentHeight = processedLines.length * lineHeight;
    const minBoxHeight = 50; // Higher minimum for more flexibility
    const totalHeight = Math.max(minBoxHeight, titleHeight + contentHeight + (boxPadding * 2));
    
    // Page break check with more space
    if (y + totalHeight + 5 > PAGE_BREAK_THRESHOLD) { // Extra buffer
      addNewPage();
      y = margin + 15;
    }
    
    // Draw box with slight shadow for depth
    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.setLineWidth(1);
    doc.rect(margin, y, contentWidth, totalHeight, 'FD');
    
    // Title - better positioning
    let yPos = y + boxPadding + 5;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.text(title, margin + boxPadding, yPos);
    
    // Content - flexible and adaptable
    yPos += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    
    processedLines.forEach((line) => {
      // Check if we need new page - with extra safety margin
      if (yPos + lineHeight + 3 > PAGE_BREAK_THRESHOLD) { // Safety buffer
        addNewPage();
        yPos = margin + 15;
        
        // Redraw box header on new page
        doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
        doc.setLineWidth(1);
        doc.rect(margin, yPos - boxPadding - 15, contentWidth, boxPadding + 12, 'FD');
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(borderColor[0], borderColor[1], borderColor[2]);
        doc.text(`${title} (continued)`, margin + boxPadding, yPos - 10);
        
        // Reset content font
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(40, 40, 40);
        yPos += 5;
      }
      
      // Flexible styling - adapts to content
      if (line.match(/^(URL|Verdict|Safety Score|Severity|Source|Impact|Type|Country|ISP|Filename|File Type|Content ID|Size|From:|To:|Subject:|Date:|Reply-To:|File Hash:|By:|Protocol:|Timestamp:|Positive Signals|Negative Signals|IP|Domain|Email|SPF|DKIM|DMARC):/i)) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(borderColor[0], borderColor[1], borderColor[2]);
      } else if (line.match(/^\s*\+/)) {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 120, 0);
      } else if (line.match(/^\s*\-/)) {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(180, 40, 40);
      } else if (line.match(/^\s*•/)) {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(40, 40, 40);
      }
      
      // Flexible text positioning with safety check
      const textWidth = doc.getTextWidth(line);
      const availableWidth = contentWidth - (boxPadding * 2);
      
      if (textWidth <= availableWidth) {
        // Fits within box - normal positioning
        doc.text(line, margin + boxPadding, yPos);
      } else {
        // Text is wide - position with margin from edge
        doc.text(line, margin + boxPadding, yPos);
        // Note: Text will wrap naturally at edge, box height handles it
      }
      
      yPos += lineHeight;
    });
    
    doc.setTextColor(0, 0, 0);
    return y + totalHeight + 10; // Extra spacing for flexibility
  };

  // Draw multi-line text that wraps and extends to new pages
  const drawMultiLineText = (y: number, text: string, maxWidth: number): number => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    
    const lines = doc.splitTextToSize(text, maxWidth);
    
    lines.forEach((line: string, index: number) => {
      // Check if current line fits, if not add new page
      if (y + LINE_HEIGHT > PAGE_BREAK_THRESHOLD) {
        addNewPage();
        y = margin + 15;
        // Reset font after page break
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
      }
      doc.text(line, margin, y);
      y += LINE_HEIGHT;
    });
    
    doc.setTextColor(0, 0, 0);
    return y + 8; // Add extra spacing after multi-line text
  };

  // Section title with improved styling
  const sectionTitle = (y: number, title: string, number: number): number => {
    if (y + SECTION_TITLE_HEIGHT > PAGE_BREAK_THRESHOLD) {
      addNewPage();
      y = margin + 15;
    }
    
    // Section number with different styling
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(139, 92, 246);
    doc.text(`${number}.`, margin, y);
    
    // Section title
    const titleX = margin + 15; // Space after number
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), titleX, y);
    
    // Decorative line under title
    doc.setDrawColor(139, 92, 246);
    doc.setLineWidth(1.5);
    doc.line(margin, y + 6, pageWidth - margin, y + 6);
    
    // Subtle shadow line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, y + 8, pageWidth - margin, y + 8);
    
    doc.setTextColor(0, 0, 0);
    return y + 25; // Increased spacing after section title
  };

  // Draw horizontal bar chart like UI
  const drawHorizontalBarChart = (y: number, title: string, data: Array<{label: string, value: number, color: number[]}>): number => {
    const chartHeight = 25 + (data.length * 20);
    
    if (y + chartHeight > pageHeight - margin - 15) {
      addNewPage();
      y = margin + 15;
    }
    
    // Title
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text(title, margin, y);
    y += 15;
    
    const maxValue = Math.max(...data.map(d => d.value), 1);
    const maxBarWidth = 100;
    const barHeight = 12;
    
    data.forEach(item => {
      if (item.value === 0) return;
      
      const barWidth = (item.value / maxValue) * maxBarWidth;
      
      // Label
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(60, 60, 60);
      doc.text(`${item.label}:`, margin, y + 8);
      
      // Bar
      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      doc.setDrawColor(200, 200, 200);
      doc.rect(margin + 80, y, barWidth, barHeight, 'FD');
      
      // Count
      doc.setFontSize(10);
      doc.text(String(item.value), margin + 80 + barWidth + 5, y + 8);
      
      y += 20;
    });
    
    doc.setTextColor(0, 0, 0);
    return y + 10;
  };

  // Draw simple pie chart using rectangles
  const drawPieChart = (y: number, title: string, data: Array<{label: string, value: number, color: number[]}>): number => {
    const chartHeight = 100;
    const blockHeight = 20;
    const blockWidth = 30;
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    if (y + chartHeight > pageHeight - margin - 15) {
      addNewPage();
      y = margin + 15;
    }
    
    // Title
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text(title, margin, y);
    y += 15;
    
    // Simple block chart instead of pie (more reliable in PDF)
    const centerX = margin + (contentWidth / 2) - (blockWidth * data.length) / 2;
    
    data.forEach((item, index) => {
      if (item.value === 0) return;
      
      const percentage = item.value / total;
      const height = Math.max(20, percentage * 60); // Min 20px height
      
      // Draw block
      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      doc.setDrawColor(200, 200, 200);
      doc.rect(centerX + (index * (blockWidth + 10)), y + 60 - height, blockWidth, height, 'FD');
      
      // Percentage text
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(60, 60, 60);
      const xPos = centerX + (index * (blockWidth + 10)) + blockWidth/2;
      
      // Percentage text
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(60, 60, 60);
      doc.text(`${(percentage * 100).toFixed(1)}%`, xPos, y + 65);
      
      // Label
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text(item.label, xPos, y + 70);
      
      // Count
      doc.setFontSize(9);
      doc.text(`(${item.value})`, xPos, y + 80);
    });
    
    doc.setTextColor(0, 0, 0);
    return y + chartHeight;
  };

  // Draw simple bar chart for attachments
  const drawAttachmentChart = (y: number, title: string, data: Array<{label: string, value: number, color: number[]}>): number => {
    const chartHeight = 80;
    const barHeight = 30;
    const barWidth = 40;
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    if (y + chartHeight > pageHeight - margin - 15) {
      addNewPage();
      y = margin + 15;
    }
    
    // Title
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text(title, margin, y);
    y += 20;
    
    // Draw bars side by side
    const startX = margin + (contentWidth - (data.length * (barWidth + 10))) / 2;
    
    data.forEach((item, index) => {
      if (item.value === 0) return;
      
      const barX = startX + (index * (barWidth + 10));
      
      // Draw bar
      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      doc.setDrawColor(200, 200, 200);
      doc.rect(barX, y, barWidth, barHeight, 'FD');
      
      // Value text on top
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(60, 60, 60);
      doc.text(String(item.value), barX + barWidth/2, y - 5);
      
      // Label below  
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text(item.label, barX + barWidth/2, y + barHeight + 10);
    });
    
    // Total in center
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text(`Total: ${total}`, margin + contentWidth/2, y + barHeight + 30);
    
    doc.setTextColor(0, 0, 0);
    return y + chartHeight + 40;
  };

  // Draw donut chart for attachment analysis
  const drawDonutChart = (y: number, title: string, data: Array<{label: string, value: number, color: number[]}>): number => {
    const outerRadius = 35;
    const innerRadius = 20;
    const centerX = margin + (contentWidth / 2);
    const centerY = y + 50;
    
    if (y + 120 > pageHeight - margin - 15) {
      addNewPage();
      y = margin + 15;
    }
    
    // Title
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text(title, centerX, y - 10, { align: 'center' });
    
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return y + 120;
    
    let currentAngle = -90;
    
    data.forEach((item) => {
      if (item.value === 0) return;
      
      const percentage = item.value / total;
      const angle = percentage * 360;
      const endAngle = currentAngle + angle;
      
      // Draw donut slice
      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(1);
      
      // Outer arc
      const outerX1 = centerX + outerRadius * Math.cos(currentAngle * Math.PI / 180);
      const outerY1 = centerY + outerRadius * Math.sin(currentAngle * Math.PI / 180);
      const outerX2 = centerX + outerRadius * Math.cos(endAngle * Math.PI / 180);
      const outerY2 = centerY + outerRadius * Math.sin(endAngle * Math.PI / 180);
      
      // Inner arc
      const innerX1 = centerX + innerRadius * Math.cos(currentAngle * Math.PI / 180);
      const innerY1 = centerY + innerRadius * Math.sin(currentAngle * Math.PI / 180);
      const innerX2 = centerX + innerRadius * Math.cos(endAngle * Math.PI / 180);
      const innerY2 = centerY + innerRadius * Math.sin(endAngle * Math.PI / 180);
      
      // Draw donut slice manually
      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(1);
      
      // Draw outer arc
      doc.circle(centerX, centerY, outerRadius, 'S');
      
      // Draw filled sector
      for (let i = currentAngle; i <= endAngle; i += 5) {
        const angleRad = i * Math.PI / 180;
        const x = centerX + outerRadius * Math.cos(angleRad);
        const y = centerY + outerRadius * Math.sin(angleRad);
        if (i === currentAngle) {
          doc.setLineWidth(0.5);
          doc.line(centerX, centerY, x, y);
        }
        // Remove the problematic lineTo call
      }
      
      // Close path and fill
      doc.fill();
      
      currentAngle = endAngle;
    });
    
    // Center text
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text(String(total), centerX, centerY, { align: 'center' });
    
    // Legend
    let legendY = centerY + outerRadius + 15;
    const legendX = centerX - 40;
    
    data.forEach((item, index) => {
      if (item.value === 0) return;
      
      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      doc.rect(legendX, legendY + (index * 15), 10, 10, 'F');
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text(`${item.label} (${item.value})`, legendX + 15, legendY + (index * 15) + 7);
    });
    
    doc.setTextColor(0, 0, 0);
    return y + 120;
  };

  // COVER PAGE
  addWatermark();
  
  // Main title
  doc.setFontSize(44);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(139, 92, 246);
  doc.text('NOLVARYN', pageWidth / 2, 55, { align: 'center' });
  
  doc.setFontSize(20);
  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'normal');
  doc.text('Email Security & Phishing Analysis', pageWidth / 2, 72, { align: 'center' });
  doc.text('Report', pageWidth / 2, 80, { align: 'center' });
  
  // Decorative line
  doc.setDrawColor(139, 92, 246);
  doc.setLineWidth(1.5);
  doc.line(margin + 50, 92, pageWidth - margin - 50, 92);
  
  // SINGLE BOX for all file info
  let yPos = 110;
  const now = new Date();
  const infoLines = [
    `Report Date: ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
    `Report Time: ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}`,
    `Email Subject: ${result.emailInfo?.subject || 'N/A'}`,
    `File Hash: ${result.emailInfo?.fileHash || 'N/A'}`,
  ];
  
  yPos = drawBox(yPos, 'REPORT INFORMATION', infoLines, colors.lightGray, [150, 150, 150]);
  
  // Classification box
  const isHighRisk = result.phishingProbability > 70;
  const isMediumRisk = result.phishingProbability > 40;
  const riskBorderColor = isHighRisk ? [220, 38, 38] : isMediumRisk ? [245, 158, 11] : [34, 197, 94];
  const riskBgColor = isHighRisk ? colors.lightRed : isMediumRisk ? colors.lightAmber : colors.lightGreen;
  
  yPos = drawBox(yPos, 'SECURITY CLASSIFICATION', [
    'CONFIDENTIAL',
    `Risk Level: ${result.riskLevel || 'Unknown'}`,
    `Phishing Probability: ${result.phishingProbability}%`,
  ], riskBgColor, riskBorderColor);
  
  // Disclaimer
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text('This report contains sensitive security analysis information.', pageWidth / 2, 265, { align: 'center' });
  doc.text('Distribution restricted to authorized personnel only.', pageWidth / 2, 273, { align: 'center' });
  
  addFooter();

  // TABLE OF CONTENTS
  addNewPage();
  yPos = sectionTitle(margin + 10, 'Table of Contents', 0);
  yPos += 10;
  
   const tocItems = [
     'Case Overview & Risk Assessment',
     'Executive Summary',
     'Risk Factors Analysis',
     'Key Findings',
     'Recommended Actions',
     'Attack Vectors (MITRE ATT&CK)',
     'Statistics & Charts',
     'URLs Analysis',
     'Attachments Analysis',
     'IP Addresses',
     'IOCs (Indicators of Compromise)',
     'Headers Analysis',
     'Email Details',
     'Threat Path Analysis',
     'Geolocation Analysis',
     'Raw Source',
   ];
  
   doc.setFontSize(11);
   tocItems.forEach((item, index) => {
     // TOC item with improved styling
     doc.setFont('helvetica', 'normal');
     doc.setTextColor(50, 50, 50);
     doc.text(item, margin, yPos);
     
     const textWidth = doc.getTextWidth(item);
     let xPos = margin + textWidth + 10;
     doc.setTextColor(180, 180, 180);
     while (xPos < pageWidth - margin - 35) {
       doc.text('.', xPos, yPos);
       xPos += 3;
     }
     
     // Page number with better styling
     doc.setTextColor(139, 92, 246);
     doc.setFont('helvetica', 'bold');
     doc.text(String(index + 3), pageWidth - margin, yPos, { align: 'right' });
     
     yPos += 10; // Better spacing
   });

  // CASE OVERVIEW
  addNewPage();
  yPos = sectionTitle(margin + 10, 'Case Overview & Risk Assessment', 1);
  
  // File info box
  yPos = drawBox(yPos, 'FILE INFORMATION', [
    `Subject: ${result.emailInfo?.subject || 'N/A'}`,
    `From: ${result.emailInfo?.from || 'N/A'}`,
    `To: ${result.emailInfo?.to || 'N/A'}`,
    `Date: ${result.emailInfo?.date || 'N/A'}`,
    `File Hash: ${result.emailInfo?.fileHash || 'N/A'}`,
  ], colors.lightGray, [150, 150, 150]);
  
  // Risk assessment box
  yPos = drawBox(yPos, 'RISK ASSESSMENT', [
    `Phishing Probability: ${result.phishingProbability}%`,
    `Risk Level: ${result.riskLevel || 'Unknown'}`,
    `Total URLs Found: ${result.urls?.length || 0}`,
    `Total Attachments: ${result.attachments?.length || 0}`,
  ], riskBgColor, riskBorderColor);

  // CONTENT SECTIONS

  // Executive Summary - FULL TEXT
  if (result.phishingProbabilityExplanation) {
    addNewPage(); // Always start on new page
    yPos = sectionTitle(margin + 10, 'Executive Summary', sectionNum++);
    yPos = drawBox(yPos, 'ANALYSIS OVERVIEW', [result.phishingProbabilityExplanation], colors.lightBlue, [100, 150, 200]);
    
    if (result.riskScoreAnalysis?.finalRationale) {
      yPos = drawBox(yPos, 'CONCLUSION', [result.riskScoreAnalysis.finalRationale], colors.lightGray, [100, 100, 100]);
    }
  }

  // Risk Factors - BOXES not tables
  if (result.riskScoreAnalysis?.negativeFactors?.length || result.riskScoreAnalysis?.positiveFactors?.length) {
    addNewPage(); // Always start on new page
    yPos = sectionTitle(margin + 10, 'Risk Factors Analysis', sectionNum++);
    
    if (result.riskScoreAnalysis.negativeFactors?.length) {
      const lines = result.riskScoreAnalysis.negativeFactors.map(f => 
        `• ${f.description} (${f.impact})`
      ); // Show all factors
      yPos = drawBox(yPos, 'NEGATIVE FACTORS', lines, colors.lightRed, [200, 100, 100]);
    }
    
    if (result.riskScoreAnalysis.positiveFactors?.length) {
      const lines = result.riskScoreAnalysis.positiveFactors.map(f => 
        `• ${f.description} (${f.impact})`
      ); // Show all factors
      yPos = drawBox(yPos, 'POSITIVE FACTORS', lines, colors.lightGreen, [100, 180, 100]);
    }
    
    if (result.riskScoreAnalysis.scoreCalculation) {
      yPos = drawBox(yPos, 'SCORE CALCULATION', [result.riskScoreAnalysis.scoreCalculation], colors.lightPurple, [150, 120, 200]);
    }
  }

  // Key Findings - BOXES
  if (result.keyFindings?.length) {
    addNewPage(); // Always start on new page
    yPos = sectionTitle(margin + 10, 'Key Findings', sectionNum++);
    
    // Show all findings
    result.keyFindings.forEach((finding, index) => {
      const isHighSeverity = finding.severity === 'Critical' || finding.severity === 'High';
      const bgColor = isHighSeverity ? colors.lightRed : finding.severity === 'Medium' ? colors.lightAmber : colors.lightBlue;
      const borderColor = isHighSeverity ? [200, 100, 100] : finding.severity === 'Medium' ? [200, 150, 80] : [100, 150, 200];
      
      const lines = [
        `Severity: ${finding.severity}`,
        `Source: ${finding.source}`,
        finding.explanation || 'No details provided',
      ]; // Full explanation
      
      yPos = drawBox(yPos, `FINDING ${index + 1}: ${finding.finding}`, lines, bgColor, borderColor);
    });
  }

  // Recommended Actions - BOXES
  if (result.recommendedActions?.length) {
    addNewPage(); // Always start on new page
    yPos = sectionTitle(margin + 10, 'Recommended Actions', sectionNum++);
    
    // Show all actions
    result.recommendedActions.forEach((action, index) => {
      const lines = action.details?.length ? action.details : ['No additional details provided']; // Full details
      yPos = drawBox(yPos, `ACTION ${index + 1}: ${action.action}`, lines, colors.lightGreen, [80, 160, 80]);
    });
  }

  // Attack Vectors - BOXES
  if (result.mitreAttackTechniques?.length) {
    addNewPage(); // Always start on new page
    yPos = sectionTitle(margin + 10, 'Attack Vectors (MITRE ATT&CK)', sectionNum++);
    
    // Show all techniques
    result.mitreAttackTechniques.forEach((technique, index) => {
      yPos = drawBox(yPos, `${technique.techniqueId}: ${technique.techniqueName}`, [technique.description || 'No description'], colors.lightAmber, [180, 140, 60]);
    });
  }

  // Statistics & Charts - CHARTS matching UI (NO TABLES)
  if (result.urls?.length || result.attachments?.length) {
    addNewPage(); // Always start on new page
    yPos = sectionTitle(margin + 10, 'Statistics & Charts', sectionNum++);
    
    // Metrics in box
    yPos = drawBox(yPos, 'ANALYSIS METRICS', [
      `URLs: ${result.urls?.length || 0}`,
      `Attachments: ${result.attachments?.length || 0}`,
      `IP Indicators: ${result.indicators?.ips?.length || 0}`,
      `Domain Indicators: ${result.indicators?.domains?.length || 0}`,
      `Email Indicators: ${result.indicators?.emails?.length || 0}`,
    ], colors.lightGray, [140, 140, 140]);
    
    // URL Chart like UI
    if (result.urls?.length) {
      const safe = result.urls.filter(u => u.verdict === 'Safe').length;
      const caution = result.urls.filter(u => u.verdict === 'Caution').length;
      const suspicious = result.urls.filter(u => u.verdict === 'Suspicious').length;
      const manual = result.urls.filter(u => u.verdict === 'Manual Review').length;
      
      const chartData = [
        { label: 'Safe', value: safe, color: [140, 220, 140] },
        { label: 'Caution', value: caution, color: [255, 220, 140] },
        { label: 'Suspicious', value: suspicious, color: [255, 180, 120] },
        { label: 'Manual Review', value: manual, color: [255, 140, 140] },
      ].filter(d => d.value > 0);
      
      if (chartData.length > 0) {
        yPos = drawPieChart(yPos, 'URL ANALYSIS BREAKDOWN', chartData);
      }
    }
    
    // Attachment Chart
    if (result.attachments?.length) {
      const withWarnings = result.attachments.filter(a => a.warning).length;
      const withoutWarnings = result.attachments.length - withWarnings;
      
      const attachData = [
        { label: 'Clean', value: withoutWarnings, color: [140, 220, 140] },
        { label: 'With Warnings', value: withWarnings, color: [255, 180, 120] },
      ].filter(d => d.value > 0);
      
      if (attachData.length > 0) {
        yPos = drawAttachmentChart(yPos, 'ATTACHMENT ANALYSIS', attachData);
      }
    }
  }

  // URLs Analysis - BOXES (NO TABLE)
  if (result.urls?.length) {
    addNewPage(); // Always start on new page
    yPos = sectionTitle(margin + 10, 'URLs Analysis', sectionNum++);
    
    // Show all URLs
    result.urls.forEach((url, index) => {
      const verdictColor = url.verdict === 'Safe' ? [100, 180, 100] :
                          url.verdict === 'Caution' ? [200, 180, 100] :
                          url.verdict === 'Suspicious' ? [220, 160, 80] : [220, 120, 120];
      const bgColor = url.verdict === 'Safe' ? colors.lightGreen :
                     url.verdict === 'Caution' ? colors.lightAmber :
                     url.verdict === 'Suspicious' ? [255, 248, 230] : colors.lightRed;
      
      // Full content
      const lines = [
        `URL: ${url.url}`,
        `Verdict: ${url.verdict}`,
        `Safety Score: ${url.safetyScore}/100`,
        '',
        'Detailed Analysis:',
        url.detailedAnalysis || 'No analysis available',
        '',
        'Positive Signals:',
        ...url.positiveSignals.map(s => `  + ${s}`),
        '',
        'Negative Signals:',
        ...url.negativeSignals.map(s => `  - ${s}`),
      ];
      
      yPos = drawBox(yPos, `URL ${index + 1}`, lines, bgColor, verdictColor);
    });
  }

  // Attachments Analysis - BOXES
  if (result.attachments?.length) {
    addNewPage(); // Always start on new page
    yPos = sectionTitle(margin + 10, 'Attachments Analysis', sectionNum++);
    
    // Show all attachments
    result.attachments.forEach((attachment, index) => {
      const hasWarning = !!attachment.warning;
      const lines = [
        `Filename: ${attachment.filename}`,
        `File Type: ${attachment.filetype}`,
        `Content ID: ${attachment.contentId}`,
        `Size: ${(attachment.sizeInBytes / 1024).toFixed(2)} KB`,
        `Inline: ${attachment.isInline ? 'Yes' : 'No'}`,
        attachment.warning ? `Warning: ${attachment.warning}` : 'No warnings',
      ];
      
      yPos = drawBox(yPos, `ATTACHMENT ${index + 1}${hasWarning ? ' ⚠️' : ''}`, lines, 
        hasWarning ? colors.lightAmber : colors.lightGray, 
        hasWarning ? [200, 160, 80] : [150, 150, 150]);
    });
  }

  // IP Addresses - BOXES (NO TABLE)
  if (result.indicators?.ips?.length) {
    addNewPage(); // Always start on new page
    yPos = sectionTitle(margin + 10, 'IP Addresses', sectionNum++);
    
    // Show all IPs
    result.indicators.ips.forEach((ip, index) => {
      const lines = [
        `IP: ${ip.ip}`,
        `Type: ${ip.type}`,
        `Country: ${ip.geolocation?.country || 'N/A'}`,
        `ISP: ${ip.network?.isp || 'N/A'}`,
        '',
        ip.analysis || 'No analysis available',
      ];
      
      yPos = drawBox(yPos, `IP ${index + 1}`, lines, colors.lightBlue, [100, 150, 200]);
    });
  }

  // IOCs - BOXES
  if (result.indicators?.domains?.length || result.indicators?.emails?.length) {
    addNewPage(); // Always start on new page
    yPos = sectionTitle(margin + 10, 'IOCs (Indicators of Compromise)', sectionNum++);
    
    if (result.indicators.domains?.length) {
      // Show all domains
      result.indicators.domains.forEach((domain, index) => {
        yPos = drawBox(yPos, `DOMAIN ${index + 1}: ${domain.domain} (${domain.type})`, [domain.analysis || 'No analysis available'], colors.lightPurple, [150, 120, 200]);
      });
    }
    
    if (result.indicators.emails?.length) {
      // Show all emails
      result.indicators.emails.forEach((email, index) => {
        yPos = drawBox(yPos, `EMAIL ${index + 1}: ${email.email} (${email.type})`, [email.analysis || 'No analysis available'], colors.lightAmber, [180, 140, 60]);
      });
    }
  }

  // Headers Analysis - BOXES (NO TABLE)
  if (result.headerAnalysis) {
    addNewPage(); // Always start on new page
    yPos = sectionTitle(margin + 10, 'Headers Analysis', sectionNum++);
    
    const authLines = [];
    if (result.headerAnalysis.spfResult) authLines.push(`SPF: ${result.headerAnalysis.spfResult.status}`);
    if (result.headerAnalysis.dkimResult) authLines.push(`DKIM: ${result.headerAnalysis.dkimResult.status}`);
    if (result.headerAnalysis.dmarcResult) authLines.push(`DMARC: ${result.headerAnalysis.dmarcResult.status}`);
    
    if (authLines.length) {
      yPos = drawBox(yPos, 'AUTHENTICATION RESULTS', authLines, colors.lightGray, [150, 150, 150]);
    }
    
    if (result.headerAnalysis.receivedPath?.length) {
      // Show all hops
      result.headerAnalysis.receivedPath.forEach((hop, index) => {
        yPos = drawBox(yPos, `HOP ${index + 1}`, [
          `From: ${hop.from}`,
          `By: ${hop.by}`,
          `Protocol: ${hop.protocol}`,
          `Timestamp: ${hop.timestamp}`,
        ], colors.lightBlue, [100, 150, 200]);
      });
    }
  }

  // Email Details - BOXES (not table rows)
  if (result.emailInfo) {
    addNewPage(); // Always start on new page
    yPos = sectionTitle(margin + 10, 'Email Details', sectionNum++);
    
    yPos = drawBox(yPos, 'EMAIL METADATA', [
      `From: ${result.emailInfo.from}`,
      `To: ${result.emailInfo.to}`,
      `Subject: ${result.emailInfo.subject}`,
      `Date: ${result.emailInfo.date}`,
    ], colors.lightGray, [150, 150, 150]);
    
    if (result.emailInfo.bodySnippet) {
      yPos = drawBox(yPos, 'EMAIL BODY PREVIEW', [result.emailInfo.bodySnippet], colors.lightBlue, [100, 150, 200]);
    }
  }

  // Threat Path Analysis (NEW SECTION)
  if (result.urls?.length || result.attachments?.length) {
    addNewPage();
    yPos = sectionTitle(margin + 10, 'Threat Path Analysis', sectionNum++);
    
    // Threat path summary
    const threatLines = [];
    if (result.urls?.length > 0) {
      threatLines.push(`Suspicious URLs detected: ${result.urls.length}`);
    }
    if (result.attachments?.length > 0) {
      threatLines.push(`Attachments requiring analysis: ${result.attachments.length}`);
    }
    if (result.phishingProbability > 70) {
      threatLines.push('High phishing probability detected');
    }
    
    yPos = drawBox(yPos, 'THREAT OVERVIEW', threatLines, colors.lightRed, [200, 100, 100]);
    
    // Attack vectors summary
    if (result.mitreAttackTechniques?.length) {
      const vectorLines = result.mitreAttackTechniques.slice(0, 3).map(t => `${t.techniqueId}: ${t.techniqueName}`);
      yPos = drawBox(yPos, 'PRIMARY ATTACK VECTORS', vectorLines, colors.lightAmber, [180, 140, 60]);
    }
  }

  // Geolocation Analysis (NEW SECTION)
  if (result.indicators?.ips?.length) {
    addNewPage();
    yPos = sectionTitle(margin + 10, 'Geolocation Analysis', sectionNum++);
    
    // Geographic distribution
    const geoSummary: string[] = [];
    const countries = [...new Set(result.indicators.ips.map(ip => ip.geolocation?.country || 'Unknown'))];
    countries.forEach(country => {
      const count = result.indicators.ips.filter(ip => ip.geolocation?.country === country).length;
      geoSummary.push(`${country}: ${count} IP(s)`);
    });
    
    yPos = drawBox(yPos, 'GEOGRAPHIC DISTRIBUTION', geoSummary, colors.lightBlue, [100, 150, 200]);
    
    // Top risky locations (filter by type)
    const riskyIps = result.indicators.ips.filter(ip => ip.type === 'hop' && ip.analysis.toLowerCase().includes('suspicious'));
    if (riskyIps.length > 0) {
      const riskyLines = riskyIps.slice(0, 3).map(ip => `• ${ip.ip} (${ip.geolocation?.country || 'Unknown'})`);
      yPos = drawBox(yPos, 'HIGH-RISK LOCATIONS', riskyLines, colors.lightRed, [200, 100, 100]);
    }
  }

  // Raw Source - FULL CONTENT, NO TRUNCATION
  if (result.rawEml) {
    addNewPage();
    yPos = sectionTitle(margin + 10, 'Raw Source (EML)', sectionNum++);
    
    doc.setFontSize(8);
    doc.setFont('courier', 'normal');
    doc.setTextColor(80, 80, 80);
    
    const lines = result.rawEml.split('\n');
    let lineY = yPos;
    const maxWidth = contentWidth;
    const rawLineHeight = 3.5; // Smaller line height for raw content
    
    lines.forEach((line) => {
      // Check if we need new page before processing this line
      if (lineY + rawLineHeight > PAGE_BREAK_THRESHOLD) {
        addNewPage();
        lineY = margin + 20;
        // Reset font after adding new page (since addNewPage might reset it)
        doc.setFontSize(8);
        doc.setFont('courier', 'normal');
        doc.setTextColor(80, 80, 80);
      }
      
      // Handle very long lines by wrapping them
      if (doc.getTextWidth(line) > maxWidth) {
        const wrappedLines = doc.splitTextToSize(line, maxWidth);
        wrappedLines.forEach((wrappedLine: string) => {
          // Check again for each wrapped line
          if (lineY + rawLineHeight > PAGE_BREAK_THRESHOLD) {
            addNewPage();
            lineY = margin + 20;
            doc.setFontSize(8);
            doc.setFont('courier', 'normal');
            doc.setTextColor(80, 80, 80);
          }
          doc.text(wrappedLine, margin, lineY);
          lineY += rawLineHeight;
        });
      } else {
        // Normal line fits within margins
        doc.text(line, margin, lineY);
        lineY += rawLineHeight;
      }
    });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
  }

  return doc;
};

export const downloadPDF = (result: AnalysisResult, filename?: string): void => {
  const doc = generatePDFReport(result);
  const subject = result.emailInfo?.subject || 'Analysis';
  const safeSubject = subject.replace(/[^a-z0-9]/gi, '_').substring(0, 30);
  const defaultFilename = `Nolvaryn_${safeSubject}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename || defaultFilename);
};