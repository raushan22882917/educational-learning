"""
Visualization service for generating educational diagrams and charts
"""

import os
import base64
from typing import Optional, Dict, Any
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
import requests


class VisualizationService:
    """Service for creating educational visualizations"""
    
    def __init__(self):
        self.wolfram_app_id = os.getenv("WOLFRAM_APP_ID")
    
    def generate_math_plot(
        self,
        expression: str,
        x_range: tuple = (-10, 10),
        save_path: Optional[str] = None
    ) -> Optional[str]:
        """
        Generate a mathematical plot using Wolfram Alpha.
        
        Args:
            expression: Mathematical expression to plot (e.g., "x^2", "sin(x)")
            x_range: Range for x-axis
            save_path: Optional path to save the image
            
        Returns:
            Path to saved image or base64 encoded image data
        """
        if not self.wolfram_app_id:
            return None
        
        try:
            # Use Wolfram Alpha Simple API for plots
            query = f"plot {expression} from x={x_range[0]} to {x_range[1]}"
            url = f"http://api.wolframalpha.com/v1/simple"
            
            params = {
                "appid": self.wolfram_app_id,
                "i": query,
                "width": 800,
                "background": "white"
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                # Load image
                image = Image.open(BytesIO(response.content))
                
                if save_path:
                    image.save(save_path)
                    return save_path
                else:
                    # Return base64
                    buffered = BytesIO()
                    image.save(buffered, format="PNG")
                    img_str = base64.b64encode(buffered.getvalue()).decode()
                    return f"data:image/png;base64,{img_str}"
            
            return None
            
        except Exception as e:
            print(f"Plot generation error: {e}")
            return None
    
    def create_concept_diagram(
        self,
        title: str,
        concepts: list,
        connections: list = None,
        save_path: Optional[str] = None
    ) -> Optional[str]:
        """
        Create a simple concept diagram.
        
        Args:
            title: Diagram title
            concepts: List of concept names
            connections: Optional list of (from_idx, to_idx) tuples
            save_path: Optional path to save
            
        Returns:
            Path or base64 encoded image
        """
        try:
            # Create image
            width, height = 800, 600
            image = Image.new('RGB', (width, height), 'white')
            draw = ImageDraw.Draw(image)
            
            # Try to load a font
            try:
                font_title = ImageFont.truetype("arial.ttf", 24)
                font_text = ImageFont.truetype("arial.ttf", 16)
            except:
                font_title = ImageFont.load_default()
                font_text = ImageFont.load_default()
            
            # Draw title
            title_bbox = draw.textbbox((0, 0), title, font=font_title)
            title_width = title_bbox[2] - title_bbox[0]
            draw.text(
                ((width - title_width) // 2, 30),
                title,
                fill='black',
                font=font_title
            )
            
            # Draw concepts in a circle
            import math
            center_x, center_y = width // 2, height // 2 + 50
            radius = 200
            
            concept_positions = []
            for i, concept in enumerate(concepts):
                angle = 2 * math.pi * i / len(concepts) - math.pi / 2
                x = center_x + radius * math.cos(angle)
                y = center_y + radius * math.sin(angle)
                
                # Draw circle
                circle_radius = 60
                draw.ellipse(
                    [x - circle_radius, y - circle_radius,
                     x + circle_radius, y + circle_radius],
                    fill='lightblue',
                    outline='blue',
                    width=2
                )
                
                # Draw text
                text_bbox = draw.textbbox((0, 0), concept, font=font_text)
                text_width = text_bbox[2] - text_bbox[0]
                text_height = text_bbox[3] - text_bbox[1]
                draw.text(
                    (x - text_width // 2, y - text_height // 2),
                    concept,
                    fill='black',
                    font=font_text
                )
                
                concept_positions.append((x, y))
            
            # Draw connections
            if connections:
                for from_idx, to_idx in connections:
                    if from_idx < len(concept_positions) and to_idx < len(concept_positions):
                        x1, y1 = concept_positions[from_idx]
                        x2, y2 = concept_positions[to_idx]
                        draw.line([(x1, y1), (x2, y2)], fill='gray', width=2)
            
            # Save or return base64
            if save_path:
                image.save(save_path)
                return save_path
            else:
                buffered = BytesIO()
                image.save(buffered, format="PNG")
                img_str = base64.b64encode(buffered.getvalue()).decode()
                return f"data:image/png;base64,{img_str}"
                
        except Exception as e:
            print(f"Diagram creation error: {e}")
            return None


# Singleton instance
_visualization_service: Optional[VisualizationService] = None


def get_visualization_service() -> VisualizationService:
    """Get or create visualization service instance"""
    global _visualization_service
    if _visualization_service is None:
        _visualization_service = VisualizationService()
    return _visualization_service
