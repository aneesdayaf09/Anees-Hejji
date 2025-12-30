import { GoogleGenAI } from "@google/genai";
import { Subject, RequestType, MaterialCategory } from "../types";

// Fix for TypeScript "Cannot find name 'process'" error
declare const process: {
  env: {
    API_KEY: string;
  };
};

// Fallback to avoid crash if key is missing (though requests will fail)
const apiKey = process.env.API_KEY || ""; 

const ai = new GoogleGenAI({ apiKey });

export const generateStudyMaterial = async (subject: Subject, unit: string, type: RequestType, materialCategory?: MaterialCategory, attachedFileName?: string, description?: string): Promise<string> => {
  if (!apiKey) {
    return "## Configuration Error\nAPI Key is missing. Please add your `API_KEY` in the Vercel Environment Variables.";
  }

  try {
    let prompt = "";
    
    // Incorporate user description into the prompt
    const contextInfo = description 
      ? `\n**Important User Context/Instructions:** The user provided the following specific details: "${description}". Please tailor the content to address this description specifically.\n` 
      : "";

    if (type === 'ANSWER_KEY') {
      prompt = `
        You are an expert educational content creator (The Builder).
        The user has requested an Answer Key for "${subject}" - Unit ${unit}.
        ${attachedFileName ? `The user also attached a file named "${attachedFileName}" (assume it contains specific problems).` : ''}
        ${contextInfo}

        Since I cannot see the user's file directly, please generate a **Template Answer Key** and a set of **Sample Problems with Solutions** relevant to standard Unit ${unit} curriculum for ${subject}.

        Structure the output in Markdown as follows:
        # Answer Key: ${subject} (Unit ${unit})
        
        ## Overview
        (Brief generic description of topics covered in this unit)

        ## Sample Problem Set & Solutions
        (Generate 3 complex problems typical for this unit and provide step-by-step solutions)
        
        1. **Problem:** ...
           **Solution:** ...
        
        2. **Problem:** ...
           **Solution:** ...
           
        3. **Problem:** ...
           **Solution:** ...

        ## Common Pitfalls
        (List common mistakes students make in this unit)
      `;
    } else {
      // Study Guide / Material Request Logic
      let instruction = "Create a comprehensive study guide.";
      let structure = `
        ## Key Concepts
        (List key concepts)
        ## Important Formulas
        (List formulas)
        ## Practice Problem
        (One example problem)
      `;

      if (materialCategory === 'MOCK_EXAM') {
        instruction = "Create a Mock Exam for the student to test their knowledge.";
        structure = `
          ## Section A: Multiple Choice (5 Questions)
          (Provide 5 questions with options)
          
          ## Section B: Free Response (2 Questions)
          (Provide 2 complex questions)
          
          ## Answer Key (at the end)
          (Provide answers for the above)
        `;
      } else if (materialCategory === 'ASSIGNMENT') {
         instruction = "Create a Homework Assignment for the student.";
         structure = `
           ## Assignment: ${subject} Unit ${unit}
           
           **Instructions:** Solve the following problems. show your work.
           
           1. (Conceptual Question)
           2. (Calculation Question)
           3. (Application Question)
           4. (Advanced Question)
           5. (Challenge Question)
         `;
      } else if (materialCategory === 'PRACTICE') {
          instruction = "Create a set of Practice Problems with detailed solutions.";
          structure = `
            ## Practice Set
            (Provide 5 problems ranging from easy to hard)
            
            ## Step-by-Step Solutions
            (Provide detailed walkthroughs for each)
          `;
      }

      prompt = `
        You are an expert educational content creator (The Builder).
        User Request: ${instruction}
        Subject: "${subject}"
        Unit: "${unit}"
        ${contextInfo}
        
        Please infer the standard curriculum topics typically associated with this unit number for high school or introductory college level ${subject}.
        
        Structure the output in Markdown as follows:
        # ${subject}: Unit ${unit} (${materialCategory})
        ${structure}
      `;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "## Error generating content. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "## System Error\nCould not generate study material at this time. Please try again later.";
  }
};